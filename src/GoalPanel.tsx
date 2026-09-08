import {useRef,useState} from 'react';
import {type Note} from './data';
import {goalDraftFields,persistGoalDraft} from './goalDraftRepository';
import {useTimePlan} from './TimeSummary';
export default function GoalPanel({note,onChange}:{note:Note;onChange:(n:Note)=>void}){
 const [open,setOpen]=useState(note.goalEnabled||note.goalDraftHours!==undefined||!!note.goalDraftDeadline),[error,setError]=useState('');
 const latest=useRef(note);latest.current=note;
 const metrics=useTimePlan().byId.get(note.id);
 const hours=note.goalDraftHours??String(note.targetHours??''),date=note.goalDraftDeadline??note.deadline??'';
 const change=(h:string,d:string)=>{const fields=goalDraftFields(latest.current,h,d),next={...latest.current,...fields};latest.current=next;onChange(next);void persistGoalDraft(next,fields).then(()=>setError('')).catch(()=>setError('Не удалось записать цель. Черновик сохранён для восстановления.'))};
 if(!open)return <section className="goal-panel goal-collapsed"><button onClick={()=>setOpen(true)}>＋ Добавить цель</button>{metrics&&metrics.targetHours>0&&<small> Цели внутри: {metrics.targetHours.toFixed(1)} ч</small>}</section>;
 return <section className="goal-panel"><div className="goal-head"><strong>Цель</strong><button className="goal-icon" aria-label="Удалить цель" onClick={()=>{change('','');setOpen(false)}}>×</button></div>
 <div className="goal-form"><input aria-label="Целевые часы" inputMode="decimal" placeholder="Часы" value={hours} onChange={e=>change(e.target.value,date)}/><input aria-label="Дата цели (необязательно)" placeholder="ДД.ММ.ГГГГ — необязательно" value={date} onChange={e=>change(hours,e.target.value)}/></div>
 <small className="goal-draft-note">{note.goalEnabled?'Сохраняется автоматически':'Черновик · можно заполнить позже'}</small>{error&&<p role="alert">{error}</p>}
 {metrics&&metrics.targetHours>0&&<div className="goal-metrics"><span>Необходимо <b>{metrics.targetHours.toFixed(1)} ч</b></span><span>Осталось <b>{metrics.remainingHours.toFixed(1)} ч</b></span>{metrics.dailyHours!==undefined&&<span>Нужно в день <b>{metrics.dailyHours.toFixed(1)} ч</b></span>}</div>}</section>;
}
