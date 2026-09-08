import { useEffect, useState } from 'react';
import './pomodoro-circle.css';
import { MoreHorizontal, Menu } from 'lucide-react';
import { db, type Note, type TrackingSession } from './data';
import { addManualEntry, elapsed, getActiveSession, getSessionsForNote, pauseTracking, resumeTracking, resetTotalTrackedTime, totalTrackedTime, setTrackingEnabled, startTracking, stopTracking } from './trackingRepository';
import { calculateGoalMetrics } from './goalRepository';
import { reconcilePomodoro, configurePomodoro, startNewPomodoroCycle } from './pomodoroRepository';
import GoalPanel from './GoalPanel';
import { createPomodoro, pomodoroElapsed, type PomodoroState } from './pomodoro';

const format=(ms:number)=>{const s=Math.floor(ms/1000);return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(v=>String(v).padStart(2,'0')).join(':')};
const totalFormat=(ms:number)=>{const m=Math.floor(ms/60000),h=Math.floor(m/60);return h?`${h} ч ${m%60} мин`:`${m} мин`};

function PomodoroCircle({state,onClick}:{state:PomodoroState;onClick:()=>void}) {
  const circumference = 2 * Math.PI * 29;
  const elapsedMs = pomodoroElapsed(state);
  const remainingSeconds = Math.ceil(Math.max(0, state.durationMs - elapsedMs) / 1000);
  const time = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(remainingSeconds % 60).padStart(2, '0')}`;
  const progress = state.status === 'work' ? Math.min(1, Math.max(0, elapsedMs / state.durationMs)) : 1;
  return <div className="pomodoro-indicator"><button className={`pomodoro-circle ${state.status}`} aria-label={`Pomodoro: ${time}. Настройки`} onClick={onClick}>
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <circle className="pomodoro-track" cx="36" cy="36" r="29" fill="none" strokeWidth="6"/>
      <circle className="pomodoro-progress" cx="36" cy="36" r="29" fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} transform="rotate(-90 36 36)"/>
      <circle className="pomodoro-marker" cx="36" cy="7" r="5" strokeWidth="2"/>
    </svg>
    <span className="pomodoro-time">{time}</span>
  </button><span className="pomodoro-caption">🍅 {state.durationMs / 60000} мин</span></div>;
}

export function TimeTrackingPanel({note,compact=false}:{note:Note;compact?:boolean}){
 const [goalNote,setGoalNote]=useState(note),[enabled,setEnabled]=useState(note.trackTime),[active,setActive]=useState<TrackingSession>(),[total,setTotal]=useState(0),[todayTotal,setTodayTotal]=useState(0),[neededPerDay,setNeededPerDay]=useState<number>(),[manualOpen,setManualOpen]=useState(false),[minutes,setMinutes]=useState(''),[comment,setComment]=useState(''),[pomodoro,setPomodoro]=useState(()=>createPomodoro()),[pomoMenu,setPomoMenu]=useState(false),[pomoMinutes,setPomoMinutes]=useState('25');
 const [,refresh]=useState(0);
 const [resetPending,setResetPending]=useState(false),[trackingError,setTrackingError]=useState('');
 const ensureSaved=async()=>{if(!(await db.notes.get(note.id)))await db.notes.put({...note,trackTime:true,updatedAt:Date.now()})};
 const load=async()=>{await reconcilePomodoro();const sessions=await getSessionsForNote(note.id);const own=sessions.filter(s=>s.status!=='completed').sort((a,b)=>b.updatedAt-a.updatedAt)[0];setActive(own);const saved=await db.notes.get(note.id);setPomodoro(own?.pomodoro??createPomodoro(saved?.pomodoroMinutes));setTotal(totalTrackedTime(sessions));const day=new Date();const todayStart=new Date(day.getFullYear(),day.getMonth(),day.getDate()).getTime();setTodayTotal(sessions.filter(s=>s.date>=todayStart).reduce((sum,s)=>sum+elapsed(s),0));if(goalNote.goalEnabled&&goalNote.targetHours&&goalNote.deadline&&goalNote.goalStartDate){const m=calculateGoalMetrics({targetHours:goalNote.targetHours,deadline:goalNote.deadline,goalStartDate:goalNote.goalStartDate,actualHoursAtGoalStart:goalNote.actualHoursAtGoalStart},sessions);setNeededPerDay(m.requiredHoursPerDay)}else setNeededPerDay(undefined)};
 useEffect(()=>{load();const timer=window.setInterval(()=>{void load();refresh(x=>x+1)},1000);return()=>window.clearInterval(timer)},[note.id,goalNote]);
 const current=active,running=current?.status==='running';
 const toggle=async()=>{await ensureSaved();if(running){await pauseTracking(current!.id)}else if(current?.status==='paused'){await resumeTracking(current.id)}else{await startTracking(note.id)}await load()};
 const stop=async()=>{if(current)await stopTracking(current.id);await load()};
 const resetTotal=async()=>{setResetPending(true);try{await ensureSaved();await resetTotalTrackedTime(note.id);await load();setTrackingError('')}catch{setTrackingError('Не удалось сбросить общее время. Попробуйте ещё раз.')}finally{setResetPending(false)}};
 const manual=async()=>{const value=Number(minutes);if(!Number.isFinite(value)||value<=0)return;await ensureSaved();await addManualEntry(note.id,value*60000,Date.now(),comment);setMinutes('');setComment('');setManualOpen(false);await load()};
 const enable=async(value:boolean)=>{await ensureSaved();if(!value&&running)await pauseTracking(current!.id);setEnabled(value);await setTrackingEnabled(note.id,true);await load()};
 const savePomoMinutes=async()=>{const value=Number(pomoMinutes);if(!Number.isFinite(value)||value<1||value>1440)return;await ensureSaved();await configurePomodoro(note.id,value);await load();setPomoMenu(false)};
 const openMenu=()=>{setPomoMinutes(String(pomodoro.durationMs/60000));setPomoMenu(v=>!v)};
 const resetPomo=async()=>{await ensureSaved();await configurePomodoro(note.id,pomodoro.durationMs/60000);await load();setPomoMenu(false)};
 const newPomoCycle=async()=>{if(!current)return;await startNewPomodoroCycle(current.id);await load();setPomoMenu(false)};
 const pomoDone=pomodoro.status==='work-complete';
 return <><section className={'tracking-panel '+(compact?'compact':'')}><button className="timer-drawer-toggle" aria-label={enabled?'Свернуть таймер':'Открыть таймер'} aria-expanded={enabled} onClick={()=>void enable(!enabled)}><Menu size={20}/><span role="img" aria-label={running?'Таймер работает':current?'Таймер на паузе':'Таймер остановлен'} className={'timer-status '+(current?'engaged':'stopped')}/></button><div className={'timer-drawer '+(enabled?'expanded':'')} inert={!enabled}><div className="timer-drawer-inner"><div className="tracking-head"><div className="tracking-left"><div className="tracking-timer-row"><div className="tracking-clock">{current?format(elapsed(current)):format(0)}</div><div className="pomodoro-wrap"><PomodoroCircle state={pomodoro} onClick={openMenu}/><button className="pomodoro-menu-button" aria-label="Меню Pomodoro" onClick={openMenu}><MoreHorizontal size={16}/></button>{pomoMenu&&<div className="pomodoro-menu"><p>Start запускает рабочий интервал. Зелёное кольцо означает его завершение.</p><label>Рабочий интервал <input type="number" min="1" value={pomoMinutes} onChange={e=>setPomoMinutes(e.target.value)}/> мин</label><button onClick={savePomoMinutes}>Сохранить</button><button onClick={resetPomo}>Сбросить Pomodoro</button><button onClick={async()=>{await stop();await resetPomo()}}>Сбросить таймер</button>{pomoDone&&running&&<button onClick={newPomoCycle}>Новый цикл</button>}</div>}</div></div></div><div className="tracking-stats"><div className="tracking-total"><strong>Всего: {totalFormat(total)}</strong><button className="reset-total" disabled={resetPending} title="Обнулить общий счётчик; история замеров и прогресс цели сохраняются" onClick={()=>void resetTotal()}>Сбросить общее время</button></div>{trackingError&&<span role="alert">{trackingError}</span>}<strong>Сделано сегодня: {totalFormat(todayTotal)}</strong>{neededPerDay!==undefined&&<strong>Нужно в день: {neededPerDay.toFixed(1)} ч</strong>}</div></div><div className="tracking-controls"><button onClick={toggle}>{running?'Пауза':current?.status==='paused'?'Продолжить':'Старт'}</button>{current&&<button onClick={stop}>Завершить</button>}<button onClick={()=>setManualOpen(true)}>+ Добавить замер</button></div>{manualOpen&&<div className="manual-entry"><input type="number" min="1" placeholder="Минуты" value={minutes} onChange={e=>setMinutes(e.target.value)}/><input placeholder="Комментарий (необязательно)" value={comment} onChange={e=>setComment(e.target.value)}/><button onClick={manual}>Добавить</button><button onClick={()=>setManualOpen(false)}>Отмена</button></div>}</div></div></section><GoalPanel note={goalNote} onChange={n=>{setGoalNote(n);setEnabled(n.trackTime)}}/></>}
export function ActiveTimerIndicator(){const [session,setSession]=useState<TrackingSession>();const [note,setNote]=useState<Note>();const [,refresh]=useState(0);const load=async()=>{await reconcilePomodoro();const s=await getActiveSession();setSession(s);setNote(s?await db.notes.get(s.noteId):undefined)};useEffect(()=>{load();const id=window.setInterval(()=>{load();refresh(x=>x+1)},1000);return()=>window.clearInterval(id)},[]);if(!session||!note)return null;return <button className="active-timer" onClick={()=>pauseTracking(session.id).then(load)}>● {note.title||'Трек'} {format(elapsed(session))}</button>}
