import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';
import App from './App';
import ProjectView from './ProjectView';
import NoteView from './NoteView';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { createChildProject, updateSubtree } from './treeRepository';
import { db, type Note } from './data';
import { useEffect, useState } from 'react';
function ProjectLauncher(){const navigate=useNavigate();const [open,setOpen]=useState(false);const [title,setTitle]=useState('');const create=async()=>{if(!title.trim())return;const id=await createChildProject(null);const note=await db.notes.get(id);if(note)await db.notes.put({...note,title:title.trim()});navigate('/project/'+id)};return <>{<button className="project-launcher" onClick={()=>setOpen(true)}>▣ Новый проект</button>}{open&&<div className="overlay" onMouseDown={()=>setOpen(false)}><div className="settings" onMouseDown={e=>e.stopPropagation()}><h2>Новый проект</h2><input className="title-input" autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="Название проекта"/><button className="save" onClick={create}>Создать</button></div></div>}</>}
function ProjectCards(){const navigate=useNavigate();const [projects,setProjects]=useState<Note[]>([]);useEffect(()=>{db.notes.toArray().then(ns=>setProjects(ns.filter(n=>n.isProject&&!n.parentId&&!n.deletedAt&&!n.archivedAt)))},[]);return projects.length?<section className="project-strip"><h2>Проекты</h2><div className="project-cards">{projects.map(p=><button className={'project-card '+p.color} key={p.id} onClick={()=>navigate('/project/'+p.id)}><span>▣</span><strong>{p.title||'Без названия'}</strong><small>{p.content||'Открыть проект'}</small></button>)}</div></section>:null}
function ProjectTreeActions(){const location=useLocation();const navigate=useNavigate();const id=location.pathname.split('/')[2];return <div className="project-tree-actions"><button onClick={()=>{if(confirm('Архивировать проект и вложенные заметки?'))updateSubtree(id,'archivedAt',Date.now()).then(()=>navigate('/archive'))}}>Архивировать subtree</button><button onClick={()=>{if(confirm('Переместить проект и вложенные заметки в корзину?'))updateSubtree(id,'deletedAt',Date.now()).then(()=>navigate('/trash'))}}>В корзину subtree</button></div>}
function Root(){const location=useLocation();if(location.pathname.startsWith('/project/'))return <><ProjectView/><ProjectTreeActions/></>;if(location.pathname.startsWith('/note/'))return <NoteView/>;return <><App/>{location.pathname==='/'&&<><ProjectCards/><ProjectLauncher/></>}</>}
createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><Root /></BrowserRouter></StrictMode>);
