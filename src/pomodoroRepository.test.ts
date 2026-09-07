import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, newNote } from './data';
import { configurePomodoro, reconcilePomodoro, startNewPomodoroCycle } from './pomodoroRepository';
import { startTracking, pauseTracking, resumeTracking, stopTracking, elapsed } from './trackingRepository';
import { pomodoroElapsed } from './pomodoro';

beforeEach(async()=>{await db.notes.clear();await db.trackingSessions.clear()});
async function setup(){const note=newNote({pomodoroMinutes:1});await db.notes.add(note);return startTracking(note.id,()=>1000)}

describe('Pomodoro rhythm never interrupts time tracking',()=>{
 it('progress calculation is half-filled halfway through work',async()=>{const session=await setup();const p=session.pomodoro!;expect(pomodoroElapsed(p,31000)/p.durationMs).toBe(0.5);expect(p.durationMs-pomodoroElapsed(p,31000)).toBe(30000)});
 it('completion marks Pomodoro green while tracking remains running and keeps counting',async()=>{const session=await setup();await reconcilePomodoro(61000);const completed=(await db.trackingSessions.get(session.id))!;expect(completed.pomodoro!.status).toBe('work-complete');expect(completed.status).toBe('running');expect(elapsed(completed,()=>181000)).toBe(180000);await reconcilePomodoro(181000);expect((await db.trackingSessions.get(session.id))!.status).toBe('running')});
 it('completion does not pause or stop tracking',async()=>{const session=await setup();await reconcilePomodoro(61000);const saved=(await db.trackingSessions.get(session.id))!;expect(saved.status).toBe('running');expect(saved.endedAt).toBeNull();expect(saved.startedAt).toBe(1000)});
 it('manual pause pauses unfinished work and resume continues it',async()=>{const session=await setup();await pauseTracking(session.id,()=>11000);const paused=(await db.trackingSessions.get(session.id))!;expect(paused.status).toBe('paused');expect(pomodoroElapsed(paused.pomodoro!,90000)).toBe(10000);await resumeTracking(session.id,()=>100000);await reconcilePomodoro(149000);const resumed=(await db.trackingSessions.get(session.id))!;expect(resumed.status).toBe('running');expect(resumed.pomodoro!.status).toBe('work');expect(pomodoroElapsed(resumed.pomodoro!,149000)).toBe(59000)});
 it('manual resume starts a fresh Pomodoro cycle after green state',async()=>{const session=await setup();await reconcilePomodoro(61000);await pauseTracking(session.id,()=>70000);await resumeTracking(session.id,()=>80000);const saved=(await db.trackingSessions.get(session.id))!;expect(saved.status).toBe('running');expect(saved.pomodoro!.status).toBe('work');expect(saved.pomodoro!.elapsedMs).toBe(0);expect(pomodoroElapsed(saved.pomodoro!,90000)).toBe(10000)});
 it('new cycle starts while the existing tracking session continues',async()=>{const session=await setup();await reconcilePomodoro(61000);const cycle=await startNewPomodoroCycle(session.id,200000);const saved=(await db.trackingSessions.get(session.id))!;expect(cycle.status).toBe('work');expect(cycle.elapsedMs).toBe(0);expect(saved.status).toBe('running');expect(elapsed(saved,()=>200000)).toBe(199000)});
 it('stop resets Pomodoro and completes tracking',async()=>{const session=await setup();await stopTracking(session.id,()=>11000);const saved=(await db.trackingSessions.get(session.id))!;expect(saved.status).toBe('completed');expect(saved.durationMs).toBe(10000);expect(saved.pomodoro!.status).toBe('idle')});
 it('reload/re-read retains running state and configured duration',async()=>{const session=await setup();await configurePomodoro(session.noteId,2,11000);const saved=(await db.trackingSessions.get(session.id))!;expect((await db.notes.get(session.noteId))!.pomodoroMinutes).toBe(2);expect(saved.status).toBe('running');expect(saved.pomodoro!.durationMs).toBe(120000);await reconcilePomodoro(131000);expect((await db.trackingSessions.get(session.id))!.pomodoro!.status).toBe('work-complete')});
 it('rejects invalid work duration',async()=>{const session=await setup();await expect(configurePomodoro(session.noteId,NaN)).rejects.toThrow();await expect(configurePomodoro(session.noteId,0)).rejects.toThrow()});
});
