import { db, newNote, type Note } from './data';
import { updateNoteFields } from './noteUpdateService';
const key='noma-pending-edits';
let queue=Promise.resolve();
function readPending():Record<string,Note>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}}
const pending=readPending();
function journal(){try{localStorage.setItem(key,JSON.stringify(pending))}catch{ /* IndexedDB remains the primary store if the recovery journal is unavailable. */ }}
const fields=(n:Note)=>({title:n.title,content:n.content,color:n.color,inToday:n.inToday,inInbox:n.inInbox,pinned:n.pinned,sortOrder:n.sortOrder});
export function saveDraft(note:Note){
 pending[note.id]=note; journal();
 const task=queue.then(async()=>{const saved=await db.transaction('rw',db.notes,db.noteRevisions,async()=>await db.notes.get(note.id)?await updateNoteFields(note.id,fields(note)):await db.notes.put(note).then(()=>note));if(pending[note.id]===note){delete pending[note.id];journal()}return saved});
 queue=task.then(()=>{},()=>{});return task;
}
export async function initializeNotes(){for(const note of Object.values(pending))await saveDraft(note);await db.transaction('rw',db.notes,async()=>{for(const [id,title] of [['noma-today-current','Текущие дела'],['noma-today-recurring','Постоянные дела']])if(!await db.notes.get(id))await db.notes.put(newNote({id,title,inToday:true,pinned:true}))})}
export const orderNotes=(notes:Note[])=>[...notes].sort((a,b)=>Number(!!b.pinned)-Number(!!a.pinned)||(a.sortOrder??-a.createdAt)-(b.sortOrder??-b.createdAt));
export async function reorderNotes(notes:Note[],source:string,target:string){const ordered=orderNotes(notes),from=ordered.findIndex(n=>n.id===source),to=ordered.findIndex(n=>n.id===target);if(from<0||to<0||!!ordered[from].pinned!==!!ordered[to].pinned)return;const [item]=ordered.splice(from,1);ordered.splice(to,0,item);await db.transaction('rw',db.notes,async()=>{for(const [index,note] of ordered.entries())await db.notes.update(note.id,{sortOrder:index})})}
