import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import './tracking.css';
import App from './App';
import ProjectView from './ProjectView';
import NoteView from './NoteView';
import { createProject, updateSubtree } from './treeRepository';
import { db, type Note } from './data';
import { useEffect, useState } from 'react';
import { ActiveTimerIndicator } from './TimeTrackingPanel';
import { TimeTrackingPanel } from './TimeTrackingPanel';
function CompactTrackingDock(){const [notes,setNotes]=useState<Note[]>([]);useEffect(()=>{const load=()=>db.notes.toArray().then(ns=>setNotes(ns.filter(n=>n.trackTime&&!n.deletedAt&&!n.archivedAt)));load();const id=window.setInterval(load,1000);return()=>window.clearInterval(id)},[]);return notes.length?<div className="compact-tracking-dock">{notes.map(n=><div className="compact-tracking-card" key={n.id}><strong>{n.title||'Без названия'}</strong><TimeTrackingPanel note={n} compact/></div>)}</div>:null}
function ProjectLauncher(){const navigate=useNavigate();const [open,setOpen]=useState(false);const [title,setTitle]=useState('');const create=async()=>{if(!title.trim())return;const project=await createProject(title);setOpen(false);setTitle('');navigate('/project/'+project.id)};return <><button className="project-launcher" onClick={()=>setOpen(true)}>▣ Новый проект</button>{open&&<div className="overlay" onMouseDown={()=>setOpen(false)}><div className="settings" onMouseDown={e=>e.stopPropagation()}><h2>Новый проект</h2><input className="title-input" autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="Название проекта"/><button className="save" onClick={create}>Создать</button></div></div>}</>}
function ProjectCards(){const navigate=useNavigate();const [projects,setProjects]=useState<Note[]>([]);useEffect(()=>{db.notes.toArray().then(ns=>setProjects(ns.filter(n=>n.isProject&&!n.parentId&&!n.deletedAt&&!n.archivedAt)))},[]);return projects.length?<section className="project-strip"><h2>Проекты</h2><div className="project-cards">{projects.map(p=><button className={'project-card '+p.color} key={p.id} onClick={()=>navigate('/project/'+p.id)}><span>▣</span><strong>{p.title||'Без названия'}</strong><small>{p.content||'Открыть проект'}</small></button>)}</div></section>:null}
function ProjectTreeActions(){const location=useLocation();const navigate=useNavigate();const id=location.pathname.split('/')[2];return <div className="project-tree-actions"><button onClick={()=>{if(confirm('Архивировать проект и вложенные заметки?'))updateSubtree(id,'archivedAt',Date.now()).then(()=>navigate('/archive'))}}>Архивировать subtree</button><button onClick={()=>{if(confirm('Переместить проект и вложенные заметки в корзину?'))updateSubtree(id,'deletedAt',Date.now()).then(()=>navigate('/trash'))}}>В корзину subtree</button></div>}
function Root(){const location=useLocation();return <><ActiveTimerIndicator/>{location.pathname.startsWith('/project/')?<><ProjectView/><ProjectTreeActions/></>:location.pathname.startsWith('/note/')?<NoteView/>:<><App/>{location.pathname==='/'&&<><ProjectCards/><ProjectLauncher/><CompactTrackingDock/></>}</>}</>}
createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><Root/></BrowserRouter></StrictMode>);
