import {type Note,type TrackingSession} from './data';
import {calendarDays,localDate} from './goalRepository';
import {elapsed,totalTrackedTimeForDate} from './trackingRepository';
export type Plan={targetHours:number;remainingHours:number;dailyHours?:number;actualHours:number;totalMs:number;todayMs:number;projectDeadline?:string;effectiveDeadline?:string;deadlineConflict:boolean};
const earlier=(a?:string|null,b?:string|null)=>a&&b?(a<b?a:b):a||b||undefined;
export function projectDeadlineFor(note:Note,notes:Map<string,Note>):string|undefined{
 let parent=note.parentId,limit:string|undefined;const seen=new Set([note.id]);
 while(parent&&!seen.has(parent)){seen.add(parent);const n=notes.get(parent);if(!n)break;if(n.isProject)limit=earlier(limit,n.deadline);parent=n.parentId}
 return limit;
}
// Raw date remains available when a moved note needs attention or an edit is incomplete.
export function deadlineCandidate(note:Note):string|null{
 const raw=note.goalDraftDeadline?.trim();
 const parts=raw&&/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(raw);
 const iso=parts?`${parts[3]}-${parts[2].padStart(2,'0')}-${parts[1].padStart(2,'0')}`:raw;
 return iso&&/^\d{4}-\d{2}-\d{2}$/.test(iso)?iso:note.deadline;
}
export function sessionWithinDeadline(s:TrackingSession,deadline:string|undefined,now:number):TrackingSession{
 if(!deadline)return s;
 const end=new Date(`${deadline}T00:00:00`);end.setDate(end.getDate()+1);const cutoff=end.getTime();
 const segments=s.timeSegments??[],known=segments.reduce((v,p)=>v+Math.max(0,p.end-p.start),0);
 const clipped=segments.filter(p=>p.start<cutoff).map(p=>({...p,end:Math.min(cutoff,p.end)}));
 const legacy=s.date<cutoff?Math.max(0,s.durationMs-known):0;
 const running=s.status==='running'&&s.startedAt!==null?Math.max(0,Math.min(now,cutoff)-s.startedAt):0;
 return {...s,status:'completed',startedAt:null,durationMs:legacy+clipped.reduce((v,p)=>v+Math.max(0,p.end-p.start),0)+running,timeSegments:[...clipped,...(running&&s.startedAt!==null?[{start:s.startedAt,end:s.startedAt+running}]:[])]};
}
export function calculateTimePlan(notes:Note[],sessions:TrackingSession[],now=Date.now()){
 const active=notes.filter(n=>!n.deletedAt&&!n.archivedAt),byId=new Map<string,Plan>(),visiting=new Set<string>(),noteMap=new Map(active.map(n=>[n.id,n]));
 const children=new Map<string,Note[]>(),ownSessions=new Map<string,TrackingSession[]>();
 for(const n of active)if(n.parentId)children.set(n.parentId,[...(children.get(n.parentId)??[]),n]);
 for(const s of sessions)ownSessions.set(s.noteId,[...(ownSessions.get(s.noteId)??[]),s]);
 const visit=(n:Note):Plan=>{
  if(byId.has(n.id))return byId.get(n.id)!;
  if(visiting.has(n.id))return {targetHours:0,remainingHours:0,actualHours:0,totalMs:0,todayMs:0,deadlineConflict:false};
  visiting.add(n.id);
  const projectDeadline=projectDeadlineFor(n,noteMap),effectiveDeadline=earlier(n.deadline,projectDeadline),candidate=deadlineCandidate(n);
  const deadlineConflict=!!(candidate&&projectDeadline&&candidate>projectDeadline);
  const nested=(children.get(n.id)??[]).map(visit);
  const ownTarget=!n.isProject&&n.goalEnabled?n.targetHours??0:0;
  const targetHours=ownTarget+nested.reduce((s,p)=>s+p.targetHours,0);
  const own=(ownSessions.get(n.id)??[]).map(s=>sessionWithinDeadline(s,effectiveDeadline,now));
  const ownActual=own.reduce((s,p)=>s+elapsed(p,()=>now)/3600000,0);
  const actualHours=ownActual+nested.reduce((s,p)=>s+p.actualHours,0),remainingHours=Math.max(0,targetHours-actualHours);
  const totalMs=own.reduce((s,p)=>s+Math.max(0,elapsed(p,()=>now)-(p.totalExcludedMs??0)),0)+nested.reduce((s,p)=>s+p.totalMs,0);
  const todayMs=totalTrackedTimeForDate(own,new Date(now),()=>now)+nested.reduce((s,p)=>s+p.todayMs,0);
  const ownDaily=effectiveDeadline&&ownTarget>0?Math.max(0,ownTarget-ownActual)/Math.max(1,calendarDays(localDate(new Date(now)),effectiveDeadline)):undefined;
  const dailyHours=ownDaily!==undefined||nested.some(p=>p.dailyHours!==undefined)?(ownDaily??0)+nested.reduce((s,p)=>s+(p.dailyHours??0),0):undefined;
  const result={targetHours,actualHours,remainingHours,dailyHours,totalMs,todayMs,projectDeadline,effectiveDeadline,deadlineConflict};byId.set(n.id,result);visiting.delete(n.id);return result;
 };
 for(const n of active)visit(n);
 const roots=active.filter(n=>!n.parentId||!noteMap.has(n.parentId));
 return {byId,dailyHours:roots.reduce((s,n)=>s+(byId.get(n.id)?.dailyHours??0),0),totalMs:roots.reduce((s,n)=>s+(byId.get(n.id)?.totalMs??0),0),todayMs:roots.reduce((s,n)=>s+(byId.get(n.id)?.todayMs??0),0)};
}
