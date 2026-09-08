import {NoteBreadcrumbs} from './NoteLocation';
import {NoteTimeBadge} from './TimeSummary';
import {PhotoPreview} from './photos/Photos';
import {updateNoteFields} from './noteUpdateService';
import {UnlockNote} from './protection/PasswordButton';
import {isLocked,forgetPassword} from './protection/noteProtection';
import {DrawingPreview} from './drawing/DrawingEditor';
import {useEffect,useState} from 'react';
import {ArrowLeft,X,Pin,FolderKanban,FileText} from 'lucide-react';
import {useLocation,useNavigate} from 'react-router-dom';
import {db,type Note} from './data';
import {saveDraft,flushDrafts,orderNotes,reorderNotes} from './noteEditing';
import NoteHistoryPanel from './NoteHistoryPanel';
import {createChildNote,createChildProject,moveNote} from './treeRepository';
import {projectTabClass,projectTabStyle} from './core/projectStyle';
import {TimeTrackingPanel} from './TimeTrackingPanel';

export default function ProjectView(){
 const id=useLocation().pathname.split('/')[2],navigate=useNavigate();
 const [project,setProject]=useState<Note>(),[children,setChildren]=useState<Note[]>([]),[projects,setProjects]=useState<Note[]>([]),[moving,setMoving]=useState<Note>(),[historyOpen,setHistoryOpen]=useState(false);
 const load=async()=>{if(!id)return;const all=await db.notes.toArray(),current=all.find(note=>note.id===id);setProject(current);setChildren(current?all.filter(note=>note.parentId===current.id&&!note.deletedAt&&!note.archivedAt):[]);setProjects(all.filter(note=>note.isProject&&!note.deletedAt&&!note.archivedAt))};
 useEffect(()=>{void load();return()=>{void flushDrafts().then(()=>forgetPassword(id))}},[id]);
 if(!project)return <section className="project-content"><button onClick={()=>navigate('/projects')}>Все проекты</button><h1>Проект не найден</h1></section>;
 if(isLocked(project))return <UnlockNote note={project} onChange={setProject} onClose={()=>navigate('/')}/>;
 const move=(parent:string|null)=>{if(!moving)return;void moveNote(moving.id,parent).then(()=>{setMoving(undefined);void load()}).catch(error=>alert(error instanceof Error?error.message:'Перемещение запрещено'))};
 return <section className="project-content project-board">
  <div className="project-topbar">
   <button className="back" onClick={()=>navigate('/projects')}><ArrowLeft size={16}/> Все проекты</button>
   <div className="note-page-actions project-toolbar" role="group" aria-label="Действия проекта">
    <button className="project-pin" aria-label={project.pinned?'Открепить проект':'Закрепить проект'} title={project.pinned?'Открепить проект':'Закрепить проект'} onClick={()=>{const n={...project,pinned:!project.pinned};setProject(n);void saveDraft(n)}}><Pin size={18} fill={project.pinned?'currentColor':'none'}/></button>
    <span className="action-divider" aria-hidden="true"/><button onClick={()=>setHistoryOpen(true)}>История</button>
    <span className="action-divider" aria-hidden="true"/><button onClick={async()=>navigate('/note/'+await createChildNote(project.id))}>Новая заметка</button>
    <span className="action-divider" aria-hidden="true"/><button onClick={async()=>navigate('/project/'+await createChildProject(project.id))}>Новый проект</button>
   </div>
  </div>
  <NoteBreadcrumbs note={project}/>
  <button className="project-description-link" onClick={()=>navigate(`/project/${project.id}/description`)}><FileText size={17}/><span>Проект: <strong>{project.title||'Без названия'}</strong></span></button>
  <TimeTrackingPanel key={project.id} note={project} onNoteChange={setProject}/>
  <div className="children-heading"><strong>Вложенные заметки и проекты</strong><span>{children.length} элементов</span></div>
  <div className="grid">{orderNotes(children).map(child=><article draggable onDragStart={e=>e.dataTransfer.setData('text/plain',child.id)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void reorderNotes(children,e.dataTransfer.getData('text/plain'),child.id).then(load)}} style={child.isProject?projectTabStyle(child.id):undefined} className={'card '+child.color+(child.isProject?' project-card '+projectTabClass(child.id):'')} key={child.id} onClick={()=>navigate(child.isProject?'/project/'+child.id:'/note/'+child.id)}><button className="pin-button" aria-label={child.pinned?'Открепить':'Закрепить'} onClick={e=>{e.stopPropagation();void updateNoteFields(child.id,{pinned:!child.pinned}).then(load)}}><Pin size={18} fill={child.pinned?'currentColor':'none'}/></button><div className="card-kind">{child.isProject?<><FolderKanban size={14}/> Подпроект</>:<><FileText size={14}/> Заметка</>}</div><h3>{child.title||'Без названия'}</h3><NoteTimeBadge note={child}/><PhotoPreview photos={child.photos}/><DrawingPreview drawing={child.drawing}/><p>{child.content||'Пусто'}</p><button onClick={event=>{event.stopPropagation();setMoving(child)}}>Переместить</button></article>)}</div>
  {moving&&<div className="overlay" onMouseDown={()=>setMoving(undefined)}><div className="settings" onMouseDown={event=>event.stopPropagation()}><div className="editor-top"><h2>Переместить</h2><button onClick={()=>setMoving(undefined)}><X size={18}/></button></div><p>Новое расположение: {moving.title||'Без названия'}</p><button onClick={()=>move(null)}>Корень — Все заметки</button>{projects.filter(candidate=>candidate.id!==moving.id).map(candidate=><button key={candidate.id} onClick={()=>move(candidate.id)}>▣ {candidate.title||'Без названия'}</button>)}</div></div>}
  {historyOpen&&<NoteHistoryPanel note={project} onChange={setProject} onClose={()=>setHistoryOpen(false)}/>}
 </section>;
}
