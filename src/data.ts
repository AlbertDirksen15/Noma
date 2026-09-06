import Dexie, { type Table } from 'dexie';
export type NoteColor = 'default'|'green'|'yellow'|'blue'|'pink'|'purple'|'gray';
export type Note = { id:string; title:string; content:string; color:NoteColor; createdAt:number; updatedAt:number; archivedAt:number|null; deletedAt:number|null; inInbox:boolean; inToday:boolean; parentId:string|null };
class NomaDB extends Dexie { notes!:Table<Note,string>; constructor(){super('noma');this.version(1).stores({notes:'id, updatedAt, archivedAt, deletedAt, inInbox, inToday, parentId'})} }
export const db=new NomaDB();
export const newNote=(extra:Partial<Note>={}):Note=>{const now=Date.now();return {id:crypto.randomUUID(),title:'',content:'',color:'default',createdAt:now,updatedAt:now,archivedAt:null,deletedAt:null,inInbox:false,inToday:false,parentId:null,...extra}};
export const searchNotes=(notes:Note[],q:string)=>{const s=q.trim().toLowerCase();return !s?notes:notes.filter(n=>`${n.title} ${n.content}`.toLowerCase().includes(s))};
