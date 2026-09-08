import {type Note,type TrackingSession} from './data';
import {calendarDays,localDate} from './goalRepository';
import {elapsed} from './trackingRepository';
export type Plan={targetHours:number;remainingHours:number;dailyHours?:number;actualHours:number};
export function calculateTimePlan(notes:Note[],sessions:TrackingSession[],now=Date.now()){
 const active=notes.filter(n=>!n.deletedAt&&!n.archivedAt),byId=new Map<string,Plan>(),visiting=new Set<string>();
 const children=new Map<string,Note[]>(),ownTime=new Map<string,number>();
 for(const n of active)if(n.parentId)children.set(n.parentId,[...(children.get(n.parentId)??[]),n]);
 for(const s of sessions)ownTime.set(s.noteId,(ownTime.get(s.noteId)??0)+elapsed(s,()=>now)/3600000);
 const visit=(n:Note):Plan=>{
  if(byId.has(n.id))return byId.get(n.id)!;
  if(visiting.has(n.id))return {targetHours:0,remainingHours:0,actualHours:0};
  visiting.add(n.id);const nested=(children.get(n.id)??[]).map(visit);
  const targetHours=Math.max(n.goalEnabled?n.targetHours??0:0,nested.reduce((s,p)=>s+p.targetHours,0));
  const actualHours=(ownTime.get(n.id)??0)+nested.reduce((s,p)=>s+p.actualHours,0),remainingHours=Math.max(0,targetHours-actualHours);
  const hasDate=!!n.deadline&&(!n.goalDraftDeadline||!!/^\d{4}-\d{2}-\d{2}$/.test(n.deadline));
  const dailyHours=hasDate&&targetHours>0?remainingHours/Math.max(1,calendarDays(localDate(new Date(now)),n.deadline!)):nested.some(p=>p.dailyHours!==undefined)?nested.reduce((s,p)=>s+(p.dailyHours??0),0):undefined;
  const result={targetHours,actualHours,remainingHours,dailyHours};byId.set(n.id,result);visiting.delete(n.id);return result;
 };
 const ids=new Set(active.map(n=>n.id));for(const n of active)visit(n);
 const roots=active.filter(n=>!n.parentId||!ids.has(n.parentId));
 return {byId,dailyHours:roots.reduce((s,n)=>s+(byId.get(n.id)?.dailyHours??0),0)};
}
