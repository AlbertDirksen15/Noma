import {DrawingPreview} from './drawing/DrawingEditor';
import { useEffect, useState } from 'react';
import { Copy, History, RotateCcw, X } from 'lucide-react';
import { db, type Note, type NoteRevision } from './data';
import { copyContentFromRevision, getRevisions, restoreRevision } from './noteRevisionRepository';

const labels:Record<NoteRevision['reason'],string>={content:'Текст',appearance:'Оформление',planning:'Планирование',move:'Перемещение',tracking:'Учёт времени',goal:'Цель',restore:'Восстановление версии','copy-content':'Копирование текста',mixed:'Изменение заметки'};
const snippet=(text:string)=>text.trim().replace(/\s+/g,' ').slice(0,90)||'Без текста';

export default function NoteHistoryPanel({note,onChange,onClose}:{note:Note;onChange:(note:Note)=>void;onClose:()=>void}){
 const [items,setItems]=useState<NoteRevision[]>([]),[selected,setSelected]=useState<NoteRevision>(),[parent,setParent]=useState('Корень — Все заметки'),[busy,setBusy]=useState(false);
 const load=async()=>{const revisions=await getRevisions(note.id);setItems(revisions);setSelected(current=>revisions.find(item=>item.id===current?.id)??revisions[0])};
 useEffect(()=>{void load()},[note.id]);
 useEffect(()=>{if(!selected?.snapshot.parentId){setParent('Корень — Все заметки');return}void db.notes.get(selected.snapshot.parentId).then(value=>setParent(value?.title||'Недоступный проект'))},[selected]);
 const restore=async()=>{if(!selected)return;setBusy(true);try{onChange(await restoreRevision(note.id,selected.id));await load()}finally{setBusy(false)}};
 const copy=async()=>{if(!selected)return;setBusy(true);try{onChange(await copyContentFromRevision(note.id,selected.id));await load()}finally{setBusy(false)}};
 return <div className="overlay history-overlay" onMouseDown={onClose}><section className="history-panel" onMouseDown={event=>event.stopPropagation()}><header className="history-header"><div><History size={18}/><h2>История</h2></div><button className="icon" aria-label="Закрыть историю" onClick={onClose}><X size={18}/></button></header>{!items.length?<p className="history-empty">Предыдущих версий пока нет. Они появятся после значимых изменений заметки.</p>:<div className="history-layout"><aside className="revision-list">{items.map(item=><button className={selected?.id===item.id?'selected':''} key={item.id} onClick={()=>setSelected(item)}><strong>{new Date(item.createdAt).toLocaleString('ru-RU')}</strong><small>{labels[item.reason]} · {snippet(item.snapshot.title)}</small></button>)}</aside>{selected&&<article className="revision-preview"><div className={'revision-color '+selected.snapshot.color}/><small>{labels[selected.reason]}</small><h3>{selected.snapshot.title||'Без названия'}</h3><DrawingPreview drawing={selected.snapshot.drawing}/><p className="revision-content">{selected.snapshot.content||'Пустая заметка'}</p><dl><div><dt>План / Inbox</dt><dd>{selected.snapshot.inToday?'В плане':'—'} · {selected.snapshot.inInbox?'На обработке':'—'}</dd></div><div><dt>Расположение</dt><dd>{parent}</dd></div><div><dt>Учёт времени</dt><dd>{selected.snapshot.trackTime?'Включён':'Выключен'}</dd></div><div><dt>Цель</dt><dd>{selected.snapshot.goalEnabled?`${selected.snapshot.targetHours} ч до ${selected.snapshot.deadline}`:'Нет'}</dd></div></dl><div className="history-actions"><button disabled={busy} onClick={copy}><Copy size={15}/> Вернуть текст</button><button className="save" disabled={busy} onClick={restore}><RotateCcw size={15}/> Восстановить версию</button></div></article>}</div>}</section></div>
}
