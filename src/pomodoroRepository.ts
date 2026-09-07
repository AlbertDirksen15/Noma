import { db } from './data';
import { createPomodoro, startPomodoro } from './pomodoro';

// Reconcile by timestamp, including after suspended tabs or reload.
export async function reconcilePomodoro(now = Date.now()) {
  await db.transaction('rw', db.trackingSessions, async () => {
    const running = await db.trackingSessions.where('status').equals('running').toArray();
    for (const session of running) {
      const p = session.pomodoro;
      if (!p || p.startedAt === null || p.status !== 'work') continue;
      const end = p.startedAt + p.durationMs;
      if (now < end) continue;
      await db.trackingSessions.update(session.id, {
        durationMs: session.durationMs + Math.max(0, end - (session.startedAt ?? end)),
        startedAt: null, status: 'paused', updatedAt: end,
        pomodoro: { ...p, status: 'work-complete', startedAt: null, elapsedMs: p.durationMs },
      });
    }
  });
}

export async function configurePomodoro(noteId: string, minutes: number, now = Date.now()) {
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440) throw new Error('Укажите от 1 до 1440 минут');
  await reconcilePomodoro(now);
  await db.transaction('rw', db.notes, db.trackingSessions, async () => {
    await db.notes.update(noteId, { pomodoroMinutes: minutes });
    const sessions = await db.trackingSessions.where('noteId').equals(noteId).toArray();
    for (const s of sessions) {
      if (s.status === 'completed') continue;
      const fresh = createPomodoro(minutes);
      await db.trackingSessions.update(s.id, { pomodoro: s.status === 'running' ? startPomodoro(fresh, now) : fresh });
    }
  });
}
