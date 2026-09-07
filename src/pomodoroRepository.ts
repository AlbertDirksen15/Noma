import { db } from './data';
import { createPomodoro, startPomodoro } from './pomodoro';

// A completed Pomodoro is only a rhythm signal. It never changes the tracking session.
export async function reconcilePomodoro(now = Date.now()) {
  await db.transaction('rw', db.trackingSessions, async () => {
    const sessions = await db.trackingSessions.toArray();
    for (const session of sessions) {
      const p = session.pomodoro;
      if (!p || p.startedAt === null || p.status !== 'work') continue;
      if (now < p.startedAt + p.durationMs) continue;
      await db.trackingSessions.update(session.id, {
        pomodoro: { ...p, status: 'work-complete', startedAt: null, elapsedMs: p.durationMs },
      });
    }
  });
}

export async function startNewPomodoroCycle(sessionId: string, now = Date.now()) {
  await reconcilePomodoro(now);
  const session = await db.trackingSessions.get(sessionId);
  if (!session || session.status !== 'running') throw new Error('Новый Pomodoro можно начать только при работающем таймере');
  const fresh = createPomodoro(session.pomodoro?.durationMs ? session.pomodoro.durationMs / 60_000 : undefined);
  const pomodoro = startPomodoro(fresh, now);
  await db.trackingSessions.update(sessionId, { pomodoro });
  return pomodoro;
}

export async function configurePomodoro(noteId: string, minutes: number, now = Date.now()) {
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440) throw new Error('Укажите от 1 до 1440 минут');
  await reconcilePomodoro(now);
  await db.transaction('rw', db.notes, db.trackingSessions, async () => {
    await db.notes.update(noteId, { pomodoroMinutes: minutes });
    const sessions = await db.trackingSessions.where('noteId').equals(noteId).toArray();
    for (const session of sessions) {
      if (session.status === 'completed') continue;
      const fresh = createPomodoro(minutes);
      await db.trackingSessions.update(session.id, { pomodoro: session.status === 'running' ? startPomodoro(fresh, now) : fresh });
    }
  });
}
