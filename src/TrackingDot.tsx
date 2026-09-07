import { useEffect, useState } from 'react';
import { getActiveSession } from './trackingRepository';
export default function TrackingDot({noteId}:{noteId:string}){const [running,setRunning]=useState(false);useEffect(()=>{const load=()=>getActiveSession().then(s=>setRunning(s?.noteId===noteId));load();const id=window.setInterval(load,1000);return()=>window.clearInterval(id)},[noteId]);return <span className={'tracking-dot '+(running?'running':'')} aria-label={running?'Таймер запущен':'Таймер остановлен'}/>}
