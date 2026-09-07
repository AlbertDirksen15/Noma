import { db, type Note, type NoteRevision, type Tombstone, type TrackingSession, type WorkspaceMeta } from './data';

export const WORKSPACE_SCHEMA_VERSION=1;
export type WorkspaceBackup={format:'noma-workspace';schemaVersion:number;workspaceId:string;exportedAt:number;appVersion:string;data:{notes:Note[];trackingSessions:TrackingSession[];noteRevisions:NoteRevision[];tombstones:Tombstone[]}};
const isObject=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null;
const identity=()=>crypto.randomUUID();
export const getWorkspaceMeta=async():Promise<WorkspaceMeta>=>{const existing=await db.workspaceMeta.get('workspace');if(existing)return existing;const now=Date.now(),meta:WorkspaceMeta={id:'workspace',workspaceId:identity(),deviceId:identity(),schemaVersion:WORKSPACE_SCHEMA_VERSION,createdAt:now,updatedAt:now};await db.workspaceMeta.put(meta);return meta};
export const createTombstone=async(entityType:Tombstone['entityType'],entityId:string,deletedAt=Date.now())=>{const tombstone:Tombstone={id:`${entityType}:${entityId}`,entityType,entityId,deletedAt};await db.tombstones.put(tombstone);return tombstone};
export const exportWorkspace=async():Promise<WorkspaceBackup>=>{const meta=await getWorkspaceMeta();const [notes,trackingSessions,noteRevisions,tombstones]=await Promise.all([db.notes.toArray(),db.trackingSessions.toArray(),db.noteRevisions.toArray(),db.tombstones.toArray()]);return {format:'noma-workspace',schemaVersion:WORKSPACE_SCHEMA_VERSION,workspaceId:meta.workspaceId,exportedAt:Date.now(),appVersion:'0.8.0',data:{notes,trackingSessions,noteRevisions,tombstones}}};
export const exportWorkspaceJson=async()=>JSON.stringify(await exportWorkspace(),null,2);
const validArray=(value:unknown)=>Array.isArray(value)&&value.every(isObject);
export const parseWorkspace=(input:string|unknown):WorkspaceBackup=>{
 let value:unknown=input;
 if(typeof input === 'string'){try{value=JSON.parse(input)}catch{throw new Error('Файл не содержит корректный JSON')}};
 if(!isObject(value)||value.format!=='noma-workspace'||value.schemaVersion!==WORKSPACE_SCHEMA_VERSION||typeof value.workspaceId !== 'string'||!isObject(value.data)||!validArray(value.data.notes)||!validArray(value.data.trackingSessions)||!validArray(value.data.noteRevisions)||!validArray(value.data.tombstones))throw new Error('Неподдерживаемый формат резервной копии');
 return value as WorkspaceBackup;
};
export const importWorkspace=async(input:string|unknown)=>{const backup=parseWorkspace(input);const local=await db.workspaceMeta.get('workspace');const now=Date.now();const meta:WorkspaceMeta={id:'workspace',workspaceId:backup.workspaceId,deviceId:local?.deviceId??identity(),schemaVersion:WORKSPACE_SCHEMA_VERSION,createdAt:local?.createdAt??now,updatedAt:now};await db.transaction('rw',db.notes,db.trackingSessions,db.noteRevisions,db.tombstones,db.workspaceMeta,async()=>{await Promise.all([db.notes.clear(),db.trackingSessions.clear(),db.noteRevisions.clear(),db.tombstones.clear(),db.workspaceMeta.clear()]);await db.notes.bulkPut(backup.data.notes);await db.trackingSessions.bulkPut(backup.data.trackingSessions);await db.noteRevisions.bulkPut(backup.data.noteRevisions);await db.tombstones.bulkPut(backup.data.tombstones);await db.workspaceMeta.put(meta)});return {notes:backup.data.notes.length,sessions:backup.data.trackingSessions.length,revisions:backup.data.noteRevisions.length,tombstones:backup.data.tombstones.length,workspaceId:meta.workspaceId}};
