import {useRef,useState} from 'react';
import {type Note} from './data';
import {goalDraftFields,persistGoalDraft} from './goalDraftRepository';
import {useTimePlan} from './TimeSummary';
export default function GoalPanel({note,onChange}:{note:Note;onChange:(n:Note)=>void}){
 const [open,setOpen]=useState(note.isProject||note.goalEnabled||note.goalDraftHours!==undefined||!!note.goalDraftDeadline),[error,setError]=useState(''),[saved,setSaved]=useState('');
 const latest=useRef(note);latest.current=note;
 const metrics=useTimePlan().byId.get(note.id);
 const hours=note.goalDraftHours??String(note.targetHours??''),date=note.goalDraftDeadline??note.deadline??'';
 const save=(h:string,d:string,explicit=false)=>{const fields=goalDraftFields(latest.current,h,d,metrics?.projectDeadline),next={...latest.current,...fields};latest.current=next;onChange(next);if(!explicit)setSaved('');void persistGoalDraft(next,fields).then(savedNote=>{latest.current=savedNote;onChange(savedNote);setError('');if(explicit)setSaved(savedNote.goalEnabled?'Цель сохранена':'Черновик сохранён')}).catch(()=>setError('Не удалось записать цель. Черновик сохранён для восстановления.'))};
 const change=(h:string,d:string)=>save(h,d);
 if(!open)return <section className="goal-panel goal-collapsed"><button onClick={()=>setOpen(true)}>＋ Добавить цель</button>{metrics&&metrics.targetHours>0&&<small> Цели внутри: {metrics.targetHours.toFixed(1)} ч</small>}</section>;
 return <section className="goal-panel"><div className="goal-head"><strong>{note.isProject?'Дата окончания проекта':'Цель'}</strong><button className="goal-icon" aria-label="Удалить цель" onClick={()=>{change('','');setOpen(note.isProject)}}>×</button></div>
 <div className="goal-form">{!note.isProject&&<input aria-label="Целевые часы" inputMode="decimal" placeholder="Часы" value={hours} onChange={e=>change(e.target.value,date)}/>}<input aria-label="Дата цели (необязательно)" placeholder="ДД.ММ.ГГГГ — необязательно" title={metrics?.projectDeadline?'Не позже '+metrics.projectDeadline:undefined} value={date} onChange={e=>change(hours,e.target.value)}/></div>
 <div className="goal-save-row"><small className="goal-draft-note">{note.goalEnabled?'Сохраняется автоматически':'Черновик · можно заполнить позже'}</small><button className="goal-save" type="button" onClick={()=>save(hours,date,true)}>Сохранить цель</button></div>{saved&&<small className="goal-saved" role="status">{saved}</small>}{error&&<p role="alert">{error}</p>}{metrics?.deadlineConflict&&<small className="deadline-message">Требует внимания: дата больше даты проекта. Расчёт до {metrics.projectDeadline}.</small>}
 {metrics&&metrics.targetHours>0&&<div className="goal-metrics"><span>Необходимо <b>{metrics.targetHours.toFixed(1)} ч</b></span><span>Осталось <b>{metrics.remainingHours.toFixed(1)} ч</b></span><span>Нужно в день <b>{metrics.dailyHours===undefined?'Укажите дату':metrics.dailyHours.toFixed(1)+' ч'}</b></span></div>}{!note.goalEnabled&&hours.trim()!==''&&date.trim()!==''&&<small className="goal-date-help">Для расчёта «Нужно в день» введите дату полностью: ДД.ММ.ГГГГ.</small>}</section>;
}
