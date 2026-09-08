import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {liveQuery} from 'dexie';
import {db,type Note,type TrackingSession} from './data';
import {calculateTimePlan} from './timePlan';
const Context=createContext({byId:new Map() as ReturnType<typeof calculateTimePlan>['byId'],dailyHours:0,total:0,today:0});
export function TimePlanProvider({children}:{children:ReactNode}){
 const [data,setData]=useState<{notes:Note[];sessions:TrackingSession[]}>({notes:[],sessions:[]}),[now,setNow]=useState(Date.now());
 useEffect(()=>{const sub=liveQuery(async()=>({notes:await db.notes.toArray(),sessions:await db.trackingSessions.toArray()})).subscribe(setData);const timer=setInterval(()=>setNow(Date.now()),1000);return()=>{sub.unsubscribe();clearInterval(timer)}},[]);
 const value=useMemo(()=>{const ids=new Set(data.notes.filter(n=>!n.deletedAt&&!n.archivedAt).map(n=>n.id)),sessions=data.sessions.filter(s=>ids.has(s.noteId));const plan=calculateTimePlan(data.notes,sessions,now);return {...plan,total:plan.totalMs,today:plan.todayMs}},[data,now]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useTimePlan=()=>useContext(Context);
const fmt=(ms:number)=>{const mins=Math.floor(ms/60000),hours=Math.floor(mins/60);return hours?`${hours} ч ${mins%60} мин`:`${mins} мин`};
export function WorkspaceTimeSummary(){const p=useTimePlan();return <div className="workspace-time" aria-label="Общее время"><span>Нужно сегодня <b>{p.dailyHours.toFixed(1)} ч</b></span><span>Сегодня <b>{fmt(p.today)}</b></span><span>Всего <b>{fmt(p.total)}</b></span></div>}
export function NoteTimeBadge({note}:{note:Note}){const p=useTimePlan().byId.get(note.id);return <>{p?.dailyHours!==undefined&&<span className="note-time-badge" title="Необходимо часов в день">{p.dailyHours.toFixed(1)} ч/д</span>}{p?.deadlineConflict&&<span className="deadline-warning" tabIndex={0} role="img" aria-label="Требует внимания: дата больше даты проекта" title={`Требует внимания: дата больше даты проекта. Расчёт до ${p.projectDeadline}.`}/>}</>}
