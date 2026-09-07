import { useEffect,useState } from 'react';
import { ArrowLeft,Plus,X } from 'lucide-react';
import { useLocation,useNavigate } from 'react-router-dom';
import { db,type Note } from './data';
import GoalPanel from './GoalPanel';
import NoteHistoryPanel from './NoteHistoryPanel';
import { createChildNote,createChildProject,getAncestors,moveNote } from './treeRepository';
import { TimeTrackingPanel } from './TimeTrackingPanel';

export default function ProjectView(){
 const id=useLocation().pathname.split('/')[2],navigate=useNavigate();
 const [project,setProject]=useState<Note>(),[children,setChildren]=useState<Note[]>([]),[crumbs,setCrumbs]=useState<Note[]>([]),[projects,setProjects]=useState<Note[]>([]),[moving,setMoving]=useState<Note>(),[historyOpen,setHistoryOpen]=useState(false);
 const load=async()=>{if(!id)return;const all=await db.notes.toArray(),current=all.find(note=>note.id===id);setProject(current);setChildren(current?all.filter(note=>note.parentId===current.id&&!note.deletedAt&&!note.archivedAt):[]);setCrumbs(current?await getAncestors(current.id):[]);setProjects(all.filter(note=>note.isProject&&!note.deletedAt&&!note.archivedAt))};
 useEffect(()=>{void load()},[id]);
 if(!project)return <main className="content"><button onClick={()=>navigate('/')}>Назад</button><h1>Проект не найден</h1></main>;
 const move=(parent:string|null)=>{if(!moving)return;void moveNote(moving.id,parent).then(()=>{setMoving(undefined);void load()}).catch(error=>alert(error instanceof Error?error.message:'Перемещение запрещено'))};
 return <main className={'content '+project.color}><button className="back" onClick={()=>navigate('/')}><ArrowLeft size={16}/> Все заметки</button><div className="note-page-actions"><button onClick={()=>setHistoryOpen(true)}>История</button></div><TimeTrackingPanel note={project}/><GoalPanel note={project} onChange={setProject}/><div className="breadcrumbs">{crumbs.map(crumb=><button key={crumb.id} onClick={()=>navigate('/project/'+crumb.id)}>{crumb.title||'Без названия'} › </button>)}<strong>{project.title||'Без названия'}</strong></div><h1>{project.title||'Без названия'}</h1><p>{project.content}</p><div className="project-actions"><button className="new" onClick={async()=>navigate('/note/'+await createChildNote(project.id))}><Plus size={16}/> Новая заметка</button><button onClick={async()=>navigate('/project/'+await createChildProject(project.id))}>Новый проект</button></div><div className="grid">{children.map(child=><article className={'card '+child.color} key={child.id} onClick={()=>navigate(child.isProject?'/project/'+child.id:'/note/'+child.id)}><h3>{child.isProject?'▣ ':''}{child.title||'Без названия'}</h3><p>{child.content||'Пусто'}</p><button onClick={event=>{event.stopPropagation();setMoving(child)}}>Переместить</button></article>)}</div>{moving&&<div className="overlay" onMouseDown={()=>setMoving(undefined)}><div className="settings" onMouseDown={event=>event.stopPropagation()}><div className="editor-top"><h2>Переместить</h2><button onClick={()=>setMoving(undefined)}><X size={18}/></button></div><p>Новое расположение: {moving.title||'Без названия'}</p><button onClick={()=>move(null)}>Корень — Все заметки</button>{projects.filter(candidate=>candidate.id!==moving.id).map(candidate=><button key={candidate.id} onClick={()=>move(candidate.id)}>▣ {candidate.title||'Без названия'}</button>)}</div></div>}{historyOpen&&<NoteHistoryPanel note={project} onChange={setProject} onClose={()=>setHistoryOpen(false)}/>}</main>
}
