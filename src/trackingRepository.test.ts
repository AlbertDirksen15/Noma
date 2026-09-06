import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, newNote } from './data';
import { addManualEntry, deleteManualEntry, elapsed, getActiveSession, getSessionsForNote, getTotalTrackedTime, pauseTracking, resumeTracking, setTrackingEnabled, startTracking, stopActiveForNote, stopTracking } from './trackingRepository';
import { archiveNote, trashNote } from './noteRepository';

let tick=1000; const clock=()=>tick;
beforeEach(async()=>{await db.notes.clear();await db.trackingSessions.clear();tick=1000});
const note=async()=>{const n=newNote();await db.notes.add(n);return n};
describe('time tracking',()=>{
 it('enables tracking on a note',async()=>{const n=await note();await setTrackingEnabled(n.id,true);expect((await db.notes.get(n.id))!.trackTime).toBe(true)});
 it('starts, pauses, resumes and stops with timestamp duration',async()=>{const n=await note();const s=await startTracking(n.id,clock);tick+=5000;const paused=await pauseTracking(s.id,clock);expect(paused!.durationMs).toBe(5000);tick+=1000;const resumed=await resumeTracking(s.id,clock);tick+=2000;const done=await stopTracking(resumed!.id,clock);expect(done!.durationMs).toBe(7000);expect(done!.status).toBe('completed')});
 it('restores elapsed time after reload from persisted timestamps',async()=>{const n=await note();const s=await startTracking(n.id,clock);tick+=1234;const persisted=await db.trackingSessions.get(s.id);expect(elapsed(persisted!,clock)).toBe(1234);expect((await getActiveSession())!.id).toBe(s.id)});
 it('allows only one active timer and pauses previous track',async()=>{const a=await note(),b=await note();const first=await startTracking(a.id,clock);tick+=100;const second=await startTracking(b.id,clock);expect((await getActiveSession())!.id).toBe(second.id);expect((await db.trackingSessions.get(first.id))!.status).toBe('paused')});
 it('supports manual entries, totals and deletion',async()=>{const n=await note();const manual=await addManualEntry(n.id,1800000,5000,'English',clock);expect(await getTotalTrackedTime(n.id)).toBe(1800000);expect((await getSessionsForNote(n.id)).find(x=>x.id===manual.id)?.manual).toBe(true);await deleteManualEntry(manual.id);expect(await getSessionsForNote(n.id)).toHaveLength(0)});
 it('cannot keep an active timer on archived or trashed notes',async()=>{const n=await note();await startTracking(n.id,clock);await db.notes.put({...n,archivedAt:2000});await stopActiveForNote(n.id,clock);expect((await getActiveSession())).toBeUndefined()});
 it('archive and trash services stop an active timer',async()=>{const a=await note();await startTracking(a.id,clock);await archiveNote(a);expect(await getActiveSession()).toBeUndefined();const b=await note();await startTracking(b.id,clock);await trashNote(b);expect(await getActiveSession()).toBeUndefined()});
 it('preserves sessions when note is moved and restored',async()=>{const n=await note();await setTrackingEnabled(n.id,true);const s=await addManualEntry(n.id,60000,5000,'',clock);const enabled=(await db.notes.get(n.id))!;await db.notes.put({...enabled,parentId:'project'});expect((await getSessionsForNote(n.id))[0].id).toBe(s.id);expect((await db.notes.get(n.id))!.trackTime).toBe(true)});
});
