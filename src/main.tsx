import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';
import App from './App';
import ProjectView from './ProjectView';
import { useLocation } from 'react-router-dom';
function Root(){const location=useLocation();return location.pathname.startsWith('/project/')?<ProjectView/>:<App/>}
createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><Root /></BrowserRouter></StrictMode>);
