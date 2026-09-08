import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import './themes/default.css';
import './styles.css';
import './tracking.css';
import App from './App';
import ProjectView from './ProjectView';
import NoteView from './NoteView';
import { updateSubtree } from './treeRepository';
import {initializeNotes} from './noteEditing';
import { useEffect, useState } from 'react';
import { ActiveTimerIndicator } from './TimeTrackingPanel';
function ProjectTreeActions(){const location=useLocation();const navigate=useNavigate();const id=location.pathname.split('/')[2];return <div className="project-tree-actions"><button onClick={()=>{if(confirm('Архивировать проект и вложенные заметки?'))updateSubtree(id,'archivedAt',Date.now()).then(()=>navigate('/archive'))}}>Архивировать проект</button><button onClick={()=>{if(confirm('Переместить проект и вложенные заметки в корзину?'))updateSubtree(id,'deletedAt',Date.now()).then(()=>navigate('/trash'))}}>Проект в корзину</button></div>}
function Root(){const location=useLocation();const [ready,setReady]=useState(false);useEffect(()=>{void initializeNotes().then(()=>setReady(true)).catch(()=>setReady(true))},[]);if(!ready)return <p>Загрузка заметок…</p>;return <><ActiveTimerIndicator/>{location.pathname.startsWith('/project/')?<><ProjectView/><ProjectTreeActions/></>:location.pathname.startsWith('/note/')?<NoteView/>:<App/>}<footer className="author-credit">Made by Albert D.</footer></>}
createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><Root/></BrowserRouter></StrictMode>);
