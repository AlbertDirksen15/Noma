import { db, type Note, type NoteRevision, type NoteSnapshot, type RevisionReason } from './data';
import { updateNoteFields } from './noteUpdateService';

export const REVISION_LIMIT=100;
export const REVISION_COALESCE_MS=3*60*1000;
const versionedKeys:(keyof NoteSnapshot)[]=['pomodoroMinutes','title','content','color','inInbox','inToday','parentId','isProject','trackTime','goalEnabled','targetHours','deadline','goalStartDate','actualHoursAtGoalStart','goalUpdatedAt'];
const lifecycleKeys=new Set<keyof Note>(['id','createdAt','updatedAt','archivedAt','deletedAt']);

export const snapshotNote=(note:Note):NoteSnapshot=>({pomodoroMinutes:note.pomodoroMinutes,title:note.title,content:note.content,color:note.color,inInbox:note.inInbox,inToday:note.inToday,parentId:note.parentId,isProject:note.isProject,trackTime:note.trackTime,goalEnabled:note.goalEnabled,targetHours:note.targetHours,deadline:note.deadline,goalStartDate:note.goalStartDate,actualHoursAtGoalStart:note.actualHoursAtGoalStart,goalUpdatedAt:note.goalUpdatedAt});
const changed=(note:Note,fields:Partial<Note>)=>versionedKeys.some(key=>key in fields&&fields[key]!==note[key]);
const reasonFor=(fields:Partial<Note>,override?:RevisionReason):RevisionReason=>{if(override)return override;const keys=Object.keys(fields).filter(key=>!lifecycleKeys.has(key as keyof Note));if(keys.every(key=>key==='title'||key==='content'))return 'content';if(keys.every(key=>key==='color'))return 'appearance';if(keys.every(key=>key==='inToday'||key==='inInbox'))return 'planning';if(keys.every(key=>key==='parentId'||key==='isProject'))return 'move';if(keys.every(key=>key==='trackTime'||key==='pomodoroMinutes'))return 'tracking';if(keys.some(key=>['goalEnabled','targetHours','deadline','goalStartDate','actualHoursAtGoalStart','goalUpdatedAt'].includes(key)))return 'goal';return 'mixed'};

export const getRevisions=(noteId:string)=>db.noteRevisions.where('noteId').equals(noteId).toArray().then(revisions=>revisions.sort((a,b)=>b.createdAt-a.createdAt||b.id.localeCompare(a.id)));
export const getRevision=(id:string)=>db.noteRevisions.get(id);
export const trimRevisions=async(noteId:string,limit=REVISION_LIMIT)=>{const revisions=await getRevisions(noteId);await Promise.all(revisions.slice(limit).map(revision=>db.noteRevisions.delete(revision.id)))};
export const deleteRevisionsForNote=(noteId:string)=>db.noteRevisions.where('noteId').equals(noteId).delete();
export const createRevision=async(note:Note,reason:RevisionReason,createdAt=Date.now())=>{const revision:NoteRevision={id:crypto.randomUUID(),noteId:note.id,snapshot:snapshotNote(note),createdAt,reason};await db.noteRevisions.add(revision);await trimRevisions(note.id);return revision};
export const captureRevisionBeforeUpdate=async(note:Note,fields:Partial<Note>,options:{reason?:RevisionReason;force?:boolean;now?:number}={})=>{if(!changed(note,fields))return undefined;const now=options.now??Date.now();if(!options.force){const latest=(await getRevisions(note.id))[0];if(latest&&now-latest.createdAt<REVISION_COALESCE_MS)return undefined}return createRevision(note,reasonFor(fields,options.reason),now)};

const parentIsSafe=async(noteId:string,parentId:string|null)=>{if(!parentId)return true;if(parentId===noteId)return false;const parent=await db.notes.get(parentId);if(!parent||parent.deletedAt||parent.archivedAt)return false;const all=await db.notes.toArray();let cursor:Note|undefined=parent;const seen=new Set<string>();while(cursor?.parentId){if(cursor.id===noteId||seen.has(cursor.id))return false;seen.add(cursor.id);cursor=all.find(note=>note.id===cursor!.parentId)}return cursor?.id!==noteId};
const safeRestoredParent=async(noteId:string,candidate:string|null,current:string|null)=>{if(await parentIsSafe(noteId,candidate))return candidate;return(await parentIsSafe(noteId,current))?current:null};

export const restoreRevision=async(noteId:string,revisionId:string)=>{const [note,revision]=await Promise.all([db.notes.get(noteId),getRevision(revisionId)]);if(!note||!revision||revision.noteId!==noteId)throw new Error('Версия заметки не найдена');const parentId=await safeRestoredParent(noteId,revision.snapshot.parentId,note.parentId);return updateNoteFields(noteId,{...revision.snapshot,parentId},{reason:'restore',forceRevision:true})};
export const copyContentFromRevision=async(noteId:string,revisionId:string)=>{const revision=await getRevision(revisionId);if(!revision||revision.noteId!==noteId)throw new Error('Версия заметки не найдена');return updateNoteFields(noteId,{title:revision.snapshot.title,content:revision.snapshot.content},{reason:'copy-content',forceRevision:true})};
