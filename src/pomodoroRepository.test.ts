import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, newNote } from './data';
import { configurePomodoro, reconcilePomodoro } from './pomodoroRepository';
import { startTracking, pauseTracking, resumeTracking, stopTracking, elapsed } from './trackingRepository';
import { pomodoroElapsed } from './pomodoro';

beforeEach(async()=>{await db.notes.clear();await db.trackingSessions.clear()});
async function setup(){const n=newNote({pomodoroMinutes:1});await db.notes.add(n);return startTracking(n.id,()=>1000)}
describe('persistent Pomodoro tracking integration',()=>{
 it('elapsed fraction drives a half-filled ring halfway through work',async()=>{const s=await setup();const p=s.pomodoro!;expect(pomodoroElapsed(p,31000)/p.durationMs).toBe(0.5);expect(p.durationMs-pomodoroElapsed(p,31000)).toBe(30000)});
 it('reload/re-read retains running countdown and duration',async()=>{const s=await setup();const loaded=(await db.trackingSessions.get(s.id))!;expect(loaded.status).toBe('running');expect(loaded.pomodoro!.durationMs-pomodoroElapsed(loaded.pomodoro!,11000)).toBe(50000)});
 it('pause persists and resume excludes paused time',async()=>{const s=await setup();await pauseTracking(s.id,()=>11000);const paused=(await db.trackingSessions.get(s.id))!;expect(pomodoroElapsed(paused.pomodoro!,90000)).toBe(10000);await resumeTracking(s.id,()=>100000);await reconcilePomodoro(150000);const done=(await db.trackingSessions.get(s.id))!;expect(done.durationMs).toBe(60000);expect(done.pomodoro!.status).toBe('work-complete')});
 it('late reload caps work at deadline and never counts break',async()=>{const s=await setup();await reconcilePomodoro(900000);const done=(await db.trackingSessions.get(s.id))!;expect(done.status).toBe('paused');expect(done.durationMs).toBe(60000);expect(done.pomodoro!.status).toBe('work-complete');await reconcilePomodoro(1900000);expect(elapsed((await db.trackingSessions.get(s.id))!,()=>1900000)).toBe(60000)});
 it('resume after green break begins a fresh work cycle',async()=>{const s=await setup();await reconcilePomodoro(61000);const next=await resumeTracking(s.id,()=>200000);expect(next!.pomodoro!.elapsedMs).toBe(0);expect(next!.pomodoro!.status).toBe('work');await reconcilePomodoro(260000);expect((await db.trackingSessions.get(s.id))!.durationMs).toBe(120000)});
 it('stop persists idle and preserves accumulated work',async()=>{const s=await setup();await stopTracking(s.id,()=>11000);const saved=(await db.trackingSessions.get(s.id))!;expect(saved.status).toBe('completed');expect(saved.durationMs).toBe(10000);expect(saved.pomodoro!.status).toBe('idle')});
 it('duration change persists and restarts interval without losing tracking',async()=>{const s=await setup();await configurePomodoro(s.noteId,2,11000);expect((await db.notes.get(s.noteId))!.pomodoroMinutes).toBe(2);expect((await db.trackingSessions.get(s.id))!.pomodoro!.durationMs).toBe(120000);await reconcilePomodoro(131000);expect((await db.trackingSessions.get(s.id))!.durationMs).toBe(130000)});
 it('switching notes pauses the previous Pomodoro',async()=>{const first=await setup();const n=newNote();await db.notes.add(n);await startTracking(n.id,()=>11000);const previous=(await db.trackingSessions.get(first.id))!;expect(previous.status).toBe('paused');expect(previous.pomodoro!.startedAt).toBeNull();expect(previous.pomodoro!.elapsedMs).toBe(10000)});
 it('rejects invalid work duration',async()=>{const s=await setup();await expect(configurePomodoro(s.noteId,NaN)).rejects.toThrow();await expect(configurePomodoro(s.noteId,0)).rejects.toThrow()});
});
