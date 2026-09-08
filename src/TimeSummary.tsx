import { useEffect, useState } from 'react';
import { db, type Note } from './data';
import { elapsed, getSessionsForNote, totalTrackedTimeForDate } from './trackingRepository';
import { calculateGoalMetrics } from './goalRepository';
import { getDescendants } from './treeRepository';

const fmt=(ms:number)=>{const mins=Math.floor(ms/60000),hours=Math.floor(mins/60);return hours?`${hours} ч ${mins%60} мин`:`${mins} мин`};

export function WorkspaceTimeSummary(){
 const [today,setToday]=useState(0),[total,setTotal]=useState(0);
 useEffect(()=>{let alive=true;const load=async()=>{const sessions=await db.trackingSessions.toArray();if(!alive)return;setTotal(sessions.reduce((sum,s)=>sum+Math.max(0,elapsed(s)-(s.totalExcludedMs??0)),0));setToday(totalTrackedTimeForDate(sessions))};void load();const id=window.setInterval(()=>void load(),1000);return()=>{alive=false;window.clearInterval(id)}},[]);
 return <div className="workspace-time" aria-label="Общее время"><span>Сегодня <b>{fmt(today)}</b></span><span>Всего <b>{fmt(total)}</b></span></div>;
}

export function NoteTimeBadge({note}:{note:Note}){
 const [needed,setNeeded]=useState<number>();
 useEffect(()=>{let alive=true;const load=async()=>{if(!note.goalEnabled||!note.targetHours||!note.deadline||!note.goalStartDate){setNeeded(undefined);return}const children=await getDescendants(note.id),ids=[note.id,...children.map(n=>n.id)],sessions=(await Promise.all(ids.map(id=>getSessionsForNote(id)))).flat();const m=calculateGoalMetrics({targetHours:note.targetHours,deadline:note.deadline,goalStartDate:note.goalStartDate,actualHoursAtGoalStart:note.actualHoursAtGoalStart},sessions);if(alive)setNeeded(m.requiredHoursPerDay)};void load();const id=window.setInterval(()=>void load(),1000);return()=>{alive=false;window.clearInterval(id)}},[note]);
 return needed===undefined?null:<span className="note-time-badge" title="Необходимо часов в день">↗ {needed.toFixed(1)} ч/д</span>;
}
