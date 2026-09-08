import 'fake-indexeddb/auto';
import {beforeEach,expect,it} from 'vitest';
import {db,newNote} from './data';
import {createChildNote,createChildProject,getAncestors,getDescendants} from './treeRepository';
import {addManualEntry} from './trackingRepository';
import {saveGoal} from './goalRepository';
beforeEach(async()=>{await db.notes.clear();await db.trackingSessions.clear()});
it('allows notes inside notes and returns mixed breadcrumbs',async()=>{const root=newNote({title:'Root'});await db.notes.put(root);const childId=await createChildNote(root.id),child=(await db.notes.get(childId))!;await db.notes.update(child.id,{title:'Child'});const grandId=await createChildProject(child.id);expect((await getDescendants(root.id)).map(n=>n.id)).toEqual([child.id,grandId]);expect((await getAncestors(grandId)).map(n=>n.title)).toEqual(['Root','Child'])});
it('goal baseline includes all nested notes and allows an over-24-hour daily pace',async()=>{const root=newNote({title:'Goal'});await db.notes.put(root);const child=await createChildNote(root.id);await addManualEntry(child,600000,Date.now());const saved=await saveGoal(root,100,'2099-01-02','2099-01-01');expect(saved.actualHoursAtGoalStart).toBeCloseTo(1/6);expect(saved.deadline).toBe('2099-01-02')});
