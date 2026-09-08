
import 'fake-indexeddb/auto';
import {beforeEach,expect,it} from 'vitest';
import {db,newNote} from './data';
const storage=new Map<string,string>();Object.defineProperty(globalThis,'localStorage',{value:{getItem:(key:string)=>storage.get(key)??null,setItem:(key:string,value:string)=>storage.set(key,value)},configurable:true});
const {initializeNotes,saveDraft,orderNotes,reorderNotes}=await import('./noteEditing');
import {saveGoal} from './goalRepository';
import {startTracking,pauseTracking,stopTracking,elapsed,getSessionsForNote} from './trackingRepository';
beforeEach(async()=>{await db.notes.clear();await db.noteRevisions.clear();await db.trackingSessions.clear()});
it('serializes rapid edits without overwriting goal or tracking fields',async()=>{const n=newNote();await db.notes.put(n);await db.notes.update(n.id,{trackTime:true,targetHours:5});await Promise.all([saveDraft({...n,title:'A'}),saveDraft({...n,title:'AB'}),saveDraft({...n,title:'ABC'})]);expect(await db.notes.get(n.id)).toMatchObject({title:'ABC',trackTime:true,targetHours:5});expect(localStorage.getItem('noma-pending-edits')).toBe('{}')});
it('creates Today defaults once and preserves their edits',async()=>{await initializeNotes();const n=(await db.notes.toArray())[0];await saveDraft({...n,title:'Edited'});await initializeNotes();expect(await db.notes.count()).toBe(2);expect((await db.notes.get(n.id))?.title).toBe('Edited');expect((await db.notes.toArray()).every(n=>n.inToday&&n.pinned)).toBe(true)});
it('keeps pinned notes above new cards and persists manual ordering',async()=>{const a=newNote({createdAt:1}),b=newNote({createdAt:2}),p=newNote({pinned:true,createdAt:0});await db.notes.bulkPut([a,b,p]);await reorderNotes([a,b,p],a.id,b.id);expect(orderNotes(await db.notes.toArray()).map(n=>n.id)).toEqual([p.id,a.id,b.id]);const newer=newNote({createdAt:100});expect(orderNotes([...(await db.notes.toArray()),newer])[0].id).toBe(p.id)});
it('saves goals with and without dates on new notes',async()=>{const n=newNote();expect(await saveGoal(n,12,null)).toMatchObject({targetHours:12,deadline:null});expect(await saveGoal(n,15,'2099-01-01')).toMatchObject({targetHours:15,deadline:'2099-01-01'})});
it('pauses elapsed time and resets the current timer without deleting tracked history',async()=>{const n=newNote();await db.notes.put(n);const s=await startTracking(n.id,()=>1000);await pauseTracking(s.id,()=>6000);expect(elapsed((await getSessionsForNote(n.id))[0],()=>9000)).toBe(5000);await stopTracking(s.id,()=>10000);expect((await getSessionsForNote(n.id))[0]).toMatchObject({status:'completed',durationMs:5000})});
