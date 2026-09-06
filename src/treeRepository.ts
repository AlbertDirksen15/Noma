import { db, newNote, type Note } from './data';
export const getChildren=(parentId:string|null)=>db.notes.where('parentId').equals(parentId as string).toArray();
export const getAncestors=async(id:string)=>{const out:Note[]=[];let n=await db.notes.get(id);while(n?.parentId){n=await db.notes.get(n.parentId);if(n)out.unshift(n)}return out};
export const getDescendants=async(id:string)=>{const all=await db.notes.toArray(),out:Note[]=[];const walk=(parent:string)=>{for(const n of all.filter(x=>x.parentId===parent)){out.push(n);walk(n.id)}};walk(id);return out};
export const canMoveNote=async(id:string,parentId:string|null)=>{if(id===parentId)return false; if(!parentId)return true;return !(await getDescendants(id)).some(n=>n.id===parentId)};
export const moveNote=async(id:string,parentId:string|null)=>{if(!(await canMoveNote(id,parentId)))throw new Error('Нельзя переместить заметку в себя или собственного потомка');const n=await db.notes.get(id);if(!n)throw new Error('Заметка не найдена');await db.notes.put({...n,parentId,updatedAt:Date.now()});return {...n,parentId}};
export const createChildNote=(parentId:string|null)=>db.notes.add(newNote({parentId}));
export const createChildProject=(parentId:string|null)=>db.notes.add(newNote({parentId,isProject:true}));
export const updateSubtree=(id:string,field:'archivedAt'|'deletedAt',value:number|null)=>getDescendants(id).then(async nodes=>{const root=await db.notes.get(id);for(const n of [root,...nodes])if(n)await db.notes.put({...n,[field]:value,updatedAt:Date.now()})});
