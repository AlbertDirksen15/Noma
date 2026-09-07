import { db, type TrackingSession } from './data';import { updateNoteFields } from './noteUpdateService';

export type Clock = () => number;
const now:Clock=()=>Date.now();
const makeSession=(noteId:string, clock:Clock):TrackingSession=>{const t=clock();return {id:crypto.randomUUID(),noteId,startedAt:t,endedAt:null,durationMs:0,status:'running',createdAt:t,updatedAt:t,manual:false,date:t}};
export const getActiveSession=()=>db.trackingSessions.where('status').equals('running').first();
export const getOpenSession=async()=>{const sessions=await db.trackingSessions.toArray();return sessions.filter(s=>s.status==='running'||s.status==='paused').sort((a,b)=>b.updatedAt-a.updatedAt)[0]};
export const getSessionsForNote=(noteId:string)=>db.trackingSessions.where('noteId').equals(noteId).sortBy('date');
export const elapsed=(s:TrackingSession, clock:Clock=now)=>s.durationMs+(s.status==='running'&&s.startedAt!==null?Math.max(0,clock()-s.startedAt):0);
export const setTrackingEnabled=async(noteId:string, enabled:boolean)=>{if(!(await db.notes.get(noteId)))throw new Error('Заметка не найдена');await updateNoteFields(noteId,{trackTime:enabled});return enabled};
export const startTracking=async(noteId:string, clock:Clock=now)=>{const note=await db.notes.get(noteId);if(!note)throw new Error('Заметка не найдена');if(note.deletedAt||note.archivedAt)throw new Error('Нельзя учитывать время архивной заметки или заметки в корзине');const active=await getActiveSession();if(active)await pauseTracking(active.id,clock);const session=makeSession(noteId,clock);await db.trackingSessions.add(session);return session};
export const pauseTracking=async(id:string, clock:Clock=now)=>{const s=await db.trackingSessions.get(id);if(!s||s.status!=='running')return s;if(s.startedAt!==null)s.durationMs+=Math.max(0,clock()-s.startedAt);const updated={...s,startedAt:null,status:'paused' as const,updatedAt:clock()};await db.trackingSessions.put(updated);return updated};
export const resumeTracking=async(id:string, clock:Clock=now)=>{const s=await db.trackingSessions.get(id);if(!s||s.status!=='paused')return s;const active=await getActiveSession();if(active)await pauseTracking(active.id,clock);const updated={...s,startedAt:clock(),status:'running' as const,updatedAt:clock()};await db.trackingSessions.put(updated);return updated};
export const stopTracking=async(id:string, clock:Clock=now)=>{const s=await db.trackingSessions.get(id);if(!s||s.status==='completed')return s;const duration=elapsed(s,clock);const t=clock();const updated={...s,durationMs:duration,startedAt:null,endedAt:t,status:'completed' as const,updatedAt:t};await db.trackingSessions.put(updated);return updated};
export const addManualEntry=async(noteId:string,durationMs:number,date:number=Date.now(),comment='',clock:Clock=now)=>{if(durationMs<=0)throw new Error('Длительность должна быть больше нуля');const t=clock();const s:TrackingSession={id:crypto.randomUUID(),noteId,startedAt:null,endedAt:null,durationMs,status:'completed',createdAt:t,updatedAt:t,manual:true,date,comment};await db.trackingSessions.add(s);return s};
export const deleteManualEntry=async(id:string)=>{const s=await db.trackingSessions.get(id);if(!s||!s.manual)throw new Error('Удалять можно только ручной замер');await db.trackingSessions.delete(id)};
export const getTotalTrackedTime=async(noteId:string)=>{const sessions=await getSessionsForNote(noteId);return sessions.reduce((sum,s)=>sum+elapsed(s),0)};
export const stopActiveForNote=async(noteId:string,clock:Clock=now)=>{const s=await db.trackingSessions.where('noteId').equals(noteId).and(x=>x.status==='running').first();if(s)await stopTracking(s.id,clock)};
export const stopActiveForSubtree=async(noteIds:string[],clock:Clock=now)=>{for(const id of noteIds)await stopActiveForNote(id,clock)};
