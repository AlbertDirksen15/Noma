import { useEffect,useState } from 'react';
import { ArrowLeft,Check } from 'lucide-react';
import { useLocation,useNavigate } from 'react-router-dom';
import { db,type Note } from './data';
import NoteHistoryPanel from './NoteHistoryPanel';
import { updateNoteFields } from './noteUpdateService';
import { TimeTrackingPanel } from './TimeTrackingPanel';

export default function NoteView(){
 const id=useLocation().pathname.split('/')[2],navigate=useNavigate();
 const [note,setNote]=useState<Note>(),[saved,setSaved]=useState(false),[historyOpen,setHistoryOpen]=useState(false);
 useEffect(()=>{if(id)void db.notes.get(id).then(setNote)},[id]);
 const save=async()=>{if(!note)return;setNote(await updateNoteFields(note.id,{title:note.title,content:note.content,color:note.color,inToday:note.inToday,inInbox:note.inInbox,trackTime:note.trackTime}));setSaved(true);window.setTimeout(()=>setSaved(false),1200)};
 useEffect(()=>{const handler=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();void save()}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[note]);
 if(!note)return <main className="content"><button onClick={()=>navigate('/')}>Назад</button><h1>Заметка не найдена</h1></main>;
 return <main className={'content '+note.color}><button className="back" onClick={()=>navigate(-1)}><ArrowLeft size={16}/> Назад</button><div className="note-page-actions"><button onClick={()=>setHistoryOpen(true)}>История</button></div><TimeTrackingPanel note={note}/><input className="title-input" value={note.title} placeholder="Название" onChange={event=>setNote({...note,title:event.target.value})}/><textarea className="note-page-text" value={note.content} placeholder="Напишите что-нибудь…" onChange={event=>setNote({...note,content:event.target.value})}/><button className="save" onClick={()=>void save()}><Check size={16}/> {saved?'Сохранено':'Сохранить'}</button>{historyOpen&&<NoteHistoryPanel note={note} onChange={setNote} onClose={()=>setHistoryOpen(false)}/>}</main>
}
