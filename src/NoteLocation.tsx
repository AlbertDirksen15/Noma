import {useEffect,useState} from 'react';
import {liveQuery} from 'dexie';
import {useNavigate} from 'react-router-dom';
import {db,type Note} from './data';
import {saveDraft,flushDrafts} from './noteEditing';
import {getAncestors,getDescendants,moveNote} from './treeRepository';
export function NoteBreadcrumbs({note,onNavigate}:{note:Note;onNavigate?:(path:string)=>void}){
 const [crumbs,setCrumbs]=useState<Note[]>([]),routeNavigate=useNavigate();
 const navigate=onNavigate??routeNavigate;
 useEffect(()=>{const sub=liveQuery(()=>getAncestors(note.id)).subscribe(setCrumbs);return()=>sub.unsubscribe()},[note.id,note.parentId]);
 return <nav className="breadcrumbs" aria-label="Расположение"><button onClick={()=>navigate(note.isProject?'/projects':'/')}>{note.isProject?'Все проекты':'Все заметки'}</button>{crumbs.map(n=><span key={n.id}><span aria-hidden="true">/</span><button onClick={()=>navigate((n.isProject?'/project/':'/note/')+n.id)}>{n.title||'Без названия'}</button></span>)}<span aria-current="page">{note.title||'Без названия'}</span></nav>;
}
export function MoveToProject({note,onChange}:{note:Note;onChange:(n:Note)=>void}){
 const [open,setOpen]=useState(false),[projects,setProjects]=useState<Note[]>([]),[error,setError]=useState('');
 const show=async()=>{await saveDraft(note);const excluded=new Set([note.id,...(await getDescendants(note.id)).map(n=>n.id)]);setProjects((await db.notes.toArray()).filter(n=>n.isProject&&!n.deletedAt&&!n.archivedAt&&!excluded.has(n.id)));setOpen(true)};
 const move=async(parent:string|null)=>{try{await flushDrafts();const saved=await moveNote(note.id,parent);onChange({...note,parentId:saved.parentId});setOpen(false)}catch(e){setError((e as Error).message)}};
 return <div className="move-project"><button onClick={()=>void show().catch(e=>setError(e.message))}>В проект</button>{open&&<div className="move-project-list"><strong>Перенести в проект</strong><button onClick={()=>void move(null)}>Все заметки</button>{projects.map(p=><button key={p.id} onClick={()=>void move(p.id)}>{p.title||'Без названия'}</button>)}{!projects.length&&<small>Доступных проектов пока нет</small>}<button onClick={()=>setOpen(false)}>Закрыть</button></div>}{error&&<small role="alert">{error}</small>}</div>;
}
