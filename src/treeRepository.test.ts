import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from './data';
import { canMoveNote, createChildNote, createChildProject, getAncestors, getChildren, getDescendants, moveNote, updateSubtree } from './treeRepository';
beforeEach(async()=>{await db.notes.clear()});
describe('nested note tree',()=>{
 it('creates projects and child notes',async()=>{const a=await createChildProject(null);const b=await createChildNote(a);expect((await getChildren(a)).map(n=>n.id)).toContain(b);});
 it('supports ancestors and descendants',async()=>{const a=await createChildProject(null);const b=await createChildProject(a);const c=await createChildNote(b);expect((await getAncestors(c)).map(n=>n.id)).toEqual([a,b]);expect((await getDescendants(a)).map(n=>n.id)).toEqual([b,c]);});
 it('moves notes and blocks cycles',async()=>{const a=await createChildProject(null);const b=await createChildProject(a);const c=await createChildNote(b);await moveNote(c,null);expect((await db.notes.get(c))!.parentId).toBeNull();expect(await canMoveNote(a,b)).toBe(false);await expect(moveNote(a,b)).rejects.toThrow();});
 it('archives and restores a subtree without changing parents',async()=>{const a=await createChildProject(null);const b=await createChildNote(a);await updateSubtree(a,'archivedAt',Date.now());expect((await db.notes.get(b))!.archivedAt).not.toBeNull();await updateSubtree(a,'archivedAt',null);expect((await db.notes.get(b))!.parentId).toBe(a);});
});
