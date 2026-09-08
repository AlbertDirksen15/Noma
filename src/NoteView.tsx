import { useEffect,useState } from 'react';
import { ArrowLeft,Pin } from 'lucide-react';
import { useLocation,useNavigate } from 'react-router-dom';
import { db,type Note } from './data';
import NoteHistoryPanel from './NoteHistoryPanel';
import {saveDraft} from './noteEditing';
import { TimeTrackingPanel } from './TimeTrackingPanel';

export default function NoteView(){
 const id=useLocation().pathname.split('/')[2],navigate=useNavigate();
 const [note,setNote]=useState<Note>(),[historyOpen,setHistoryOpen]=useState(false);
 useEffect(()=>{if(id)void db.notes.get(id).then(setNote)},[id]);
 const save=async()=>{if(note)await saveDraft(note)};
 const edit=(n:Note)=>{setNote(n);void saveDraft(n)};
 useEffect(()=>{const handler=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();void save()}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[note]);
 if(!note)return <main className="content"><button onClick={()=>navigate('/')}>Назад</button><h1>Заметка не найдена</h1></main>;
 return <main className={'content '+note.color}><button className="back" onClick={()=>navigate(-1)}><ArrowLeft size={16}/> Назад</button><div className="note-page-actions"><button aria-label="Закрепить" onClick={()=>edit({...note,pinned:!note.pinned})}><Pin size={20} fill={note.pinned?'currentColor':'none'}/></button><button onClick={()=>setHistoryOpen(true)}>История</button></div><TimeTrackingPanel key={note.id} note={note}/><input className="title-input" value={note.title} placeholder="Название" onChange={event=>edit({...note,title:event.target.value})}/><textarea className="note-page-text" value={note.content} placeholder="Напишите что-нибудь…" onChange={event=>setNote({...note,content:event.target.value})}/><button className="save" onClick={()=>void save().then(()=>navigate(-1))}>Закрыть</button>{historyOpen&&<NoteHistoryPanel note={note} onChange={setNote} onClose={()=>setHistoryOpen(false)}/>}</main>
}
