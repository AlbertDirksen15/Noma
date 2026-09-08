import {db,newNote,type Note} from './data';
import {localDate} from './goalRepository';
import {updateNoteFields} from './noteUpdateService';
const key='noma-goal-drafts';
const read=():Record<string,Partial<Note>>=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
const pending=read();let queue=Promise.resolve();
const journal=()=>{try{localStorage.setItem(key,JSON.stringify(pending))}catch{/* IndexedDB still saves the draft. */}};
export function parseGoalDate(raw:string):string|null|undefined {
 if(!raw.trim())return null;
 const parts=/^(\d{1,2})[.](\d{1,2})[.](\d{4})$/.exec(raw.trim());
 const iso=parts?`${parts[3]}-${parts[2].padStart(2,'0')}-${parts[1].padStart(2,'0')}`:raw.trim();
 if(!/^\d{4}-\d{2}-\d{2}$/.test(iso))return undefined;
 const date=new Date(`${iso}T12:00:00`);
 return Number.isFinite(date.getTime())&&localDate(date)===iso?iso:undefined;
}
export function goalDraftFields(note:Note,hours:string,date:string):Partial<Note>{
 const target=Number(hours.replace(',','.')),deadline=parseGoalDate(date);
 const valid=hours.trim()!==''&&Number.isFinite(target)&&target>0&&deadline!==undefined;
 return {goalDraftHours:hours,goalDraftDeadline:date,goalEnabled:valid,targetHours:valid?target:null,deadline:deadline??null,goalStartDate:note.goalStartDate??localDate(new Date()),goalUpdatedAt:Date.now()};
}
export function persistGoalDraft(note:Note,fields:Partial<Note>){
 pending[note.id]=fields;journal();
 const task=queue.then(()=>db.transaction('rw',db.notes,db.noteRevisions,async()=>{
  if(!await db.notes.get(note.id))await db.notes.put(note);
  const saved=await updateNoteFields(note.id,fields);
  if(pending[note.id]===fields){delete pending[note.id];journal()}
  return saved;
 }));queue=task.then(()=>{},()=>{});return task;
}
export async function recoverGoalDrafts(){for(const [id,fields] of Object.entries(pending))await persistGoalDraft((await db.notes.get(id))??newNote({id}),fields)}
export const flushGoalDrafts=()=>queue;
