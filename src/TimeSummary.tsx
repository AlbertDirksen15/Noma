import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {liveQuery} from 'dexie';
import {db,type Note,type TrackingSession} from './data';
import {totalTrackedTime,totalTrackedTimeForDate} from './trackingRepository';
import {calculateTimePlan} from './timePlan';
const Context=createContext({byId:new Map() as ReturnType<typeof calculateTimePlan>['byId'],dailyHours:0,total:0,today:0});
export function TimePlanProvider({children}:{children:ReactNode}){
 const [data,setData]=useState<{notes:Note[];sessions:TrackingSession[]}>({notes:[],sessions:[]}),[now,setNow]=useState(Date.now());
 useEffect(()=>{const sub=liveQuery(async()=>({notes:await db.notes.toArray(),sessions:await db.trackingSessions.toArray()})).subscribe(setData);const timer=setInterval(()=>setNow(Date.now()),1000);return()=>{sub.unsubscribe();clearInterval(timer)}},[]);
 const value=useMemo(()=>{const ids=new Set(data.notes.filter(n=>!n.deletedAt&&!n.archivedAt).map(n=>n.id)),sessions=data.sessions.filter(s=>ids.has(s.noteId));return {...calculateTimePlan(data.notes,sessions,now),total:totalTrackedTime(sessions,()=>now),today:totalTrackedTimeForDate(sessions,new Date(now),()=>now)}},[data,now]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useTimePlan=()=>useContext(Context);
const fmt=(ms:number)=>{const mins=Math.floor(ms/60000),hours=Math.floor(mins/60);return hours?`${hours} ч ${mins%60} мин`:`${mins} мин`};
export function WorkspaceTimeSummary(){const p=useTimePlan();return <div className="workspace-time" aria-label="Общее время"><span>Нужно в день <b>{p.dailyHours.toFixed(1)} ч</b></span><span>Сегодня <b>{fmt(p.today)}</b></span><span>Всего <b>{fmt(p.total)}</b></span></div>}
export function NoteTimeBadge({note}:{note:Note}){const p=useTimePlan().byId.get(note.id);return p?.dailyHours===undefined?null:<span className="note-time-badge" title="Необходимо часов в день">{p.dailyHours.toFixed(1)} ч/д</span>}
