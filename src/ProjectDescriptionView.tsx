import {useEffect,useState} from 'react';
import {ArrowLeft,FolderKanban} from 'lucide-react';
import {useLocation,useNavigate} from 'react-router-dom';
import {db,type Note} from './data';
import {NoteBreadcrumbs} from './NoteLocation';
import {saveDraft,flushDrafts} from './noteEditing';
import {UnlockNote} from './protection/PasswordButton';
import {forgetPassword,isLocked} from './protection/noteProtection';

export default function ProjectDescriptionView(){
 const id=useLocation().pathname.split('/')[2],navigate=useNavigate(),[project,setProject]=useState<Note>();
 useEffect(()=>{void db.notes.get(id).then(setProject);return()=>{void flushDrafts().then(()=>forgetPassword(id))}},[id]);
 if(!project)return <section className="content project-description"><button className="back" onClick={()=>navigate('/projects')}><ArrowLeft size={16}/> Все проекты</button><h1>Проект не найден</h1></section>;
 if(isLocked(project))return <UnlockNote note={project} onChange={setProject} onClose={()=>navigate('/project/'+project.id)}/>;
 const edit=(next:Note)=>{setProject(next);void saveDraft(next)};
 return <section className={'content project-description '+project.color}>
  <button className="back" onClick={()=>navigate('/project/'+project.id)}><ArrowLeft size={16}/> К доске проекта</button>
  <NoteBreadcrumbs note={project}/>
  <div className="project-description-kind"><FolderKanban size={16}/> Описание проекта</div>
  <input className="title-input" value={project.title} placeholder="Название проекта" onChange={event=>edit({...project,title:event.target.value})}/>
  <textarea className="note-page-text project-description-text" value={project.content} placeholder="Опишите проект…" onChange={event=>edit({...project,content:event.target.value})}/>
  <button className="save" onClick={()=>void flushDrafts().then(()=>navigate('/project/'+project.id))}>Закрыть</button>
 </section>;
}
