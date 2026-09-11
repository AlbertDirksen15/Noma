import {TimePlanProvider} from './TimeSummary';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import './themes/default.css';
import './styles.css';
import './tracking.css';
import App from './App';
import ProjectView from './ProjectView';
import ProjectDescriptionView from './ProjectDescriptionView';
import NoteView from './NoteView';
import {initializeNotes} from './noteEditing';
import { useEffect, useState } from 'react';
import { ActiveTimerIndicator } from './TimeTrackingPanel';
function Root(){const location=useLocation();const [ready,setReady]=useState(false),description=/^\/project\/[^/]+\/description\/?$/.test(location.pathname);useEffect(()=>{void initializeNotes().then(()=>setReady(true)).catch(()=>setReady(true))},[]);if(!ready)return <p>Загрузка заметок…</p>;return <TimePlanProvider><ActiveTimerIndicator/><App>{description?<div className="workspace-detail"><ProjectDescriptionView key={location.pathname}/></div>:location.pathname.startsWith('/project/')?<div className="workspace-detail"><ProjectView key={location.pathname}/></div>:location.pathname.startsWith('/note/')?<NoteView key={location.pathname}/>:undefined}</App><footer className="author-credit">Made by Albert D.</footer></TimePlanProvider>}
createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><Root/></BrowserRouter></StrictMode>);
