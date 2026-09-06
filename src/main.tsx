import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';
import App from './App';
import ProjectView from './ProjectView';
import NoteView from './NoteView';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { createChildProject } from './treeRepository';
import { db } from './data';
function ProjectLauncher(){const navigate=useNavigate();return <button className="project-launcher" onClick={async()=>{const title=prompt('Название проекта');if(title?.trim()){const id=await createChildProject(null);const note=await db.notes.get(id);if(note)await db.notes.put({...note,title:title.trim()});navigate('/project/'+id)}}}>▣ Новый проект</button>}
function Root(){const location=useLocation();if(location.pathname.startsWith('/project/'))return <ProjectView/>;if(location.pathname.startsWith('/note/'))return <NoteView/>;return <><App/>{location.pathname==='/'&&<ProjectLauncher/>}</>}
createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><Root /></BrowserRouter></StrictMode>);
