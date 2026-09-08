import {PhotoButton,PhotoGallery,PhotoPreview,PhotoTrash} from './photos/Photos';
import PasswordButton,{UnlockNote} from './protection/PasswordButton';
import {isLocked,forgetPassword} from './protection/noteProtection';
import DrawingButton,{DrawingPreview} from './drawing/DrawingEditor';
import { useEffect,useState } from 'react';
import { ArrowLeft,Pin,Plus,FolderKanban,FileText } from 'lucide-react';
import { useLocation,useNavigate } from 'react-router-dom';
import { db,type Note } from './data';
import NoteHistoryPanel from './NoteHistoryPanel';
import {saveDraft,flushDrafts} from './noteEditing';
import { TimeTrackingPanel } from './TimeTrackingPanel';
import { createChildNote,createChildProject,getAncestors } from './treeRepository';

export default function NoteView(){
 const id=useLocation().pathname.split('/')[2],navigate=useNavigate();
 const [note,setNote]=useState<Note>(),[children,setChildren]=useState<Note[]>([]),[crumbs,setCrumbs]=useState<Note[]>([]),[historyOpen,setHistoryOpen]=useState(false);
 useEffect(()=>{if(id){void db.notes.get(id).then(async n=>{setNote(n);if(n){const all=await db.notes.toArray();setChildren(all.filter(x=>x.parentId===n.id&&!x.deletedAt&&!x.archivedAt));setCrumbs(await getAncestors(n.id))}})}return()=>{void flushDrafts().then(()=>forgetPassword(id))}},[id]);
 const save=async()=>{if(note)await saveDraft(note)};
 const edit=async(n:Note)=>{setNote(n);await saveDraft(n)};
 useEffect(()=>{const handler=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();void save()}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler)},[note]);
 if(!note)return <main className="content"><button onClick={()=>navigate('/')}>Назад</button><h1>Заметка не найдена</h1></main>;
 if(isLocked(note))return <UnlockNote note={note} onChange={setNote} onClose={()=>navigate(-1)}/>;
 const openChild=async(isProject:boolean)=>{const childId=isProject?await createChildProject(note.id):await createChildNote(note.id);navigate(isProject?'/project/'+childId:'/note/'+childId)};
 return <main className={'content '+note.color}><button className="back" onClick={()=>navigate(-1)}><ArrowLeft size={16}/> Назад</button><div className="breadcrumbs">{crumbs.map(crumb=><button key={crumb.id} onClick={()=>navigate(crumb.isProject?"/project/"+crumb.id:"/note/"+crumb.id)}>{crumb.title||"Без названия"} › </button>)}<strong>{note.title||"Без названия"}</strong></div><div className="note-page-actions"><button aria-label="Закрепить" onClick={()=>edit({...note,pinned:!note.pinned})}><Pin size={20} fill={note.pinned?'currentColor':'none'}/></button><button onClick={()=>setHistoryOpen(true)}>История</button></div><TimeTrackingPanel key={note.id} note={note} onNoteChange={setNote}/><div className="note-children"><div className="children-heading"><strong>Вложенные записи</strong><span>{children.length} элементов</span></div><div className="project-actions"><button className="new" onClick={()=>void openChild(false)}><Plus size={16}/> Новая заметка</button><button onClick={()=>void openChild(true)}><FolderKanban size={16}/> Подпроект</button></div>{children.length>0&&<div className="nested-links">{children.map(child=><button key={child.id} onClick={()=>navigate(child.isProject?'/project/'+child.id:'/note/'+child.id)}><span>{child.isProject?<FolderKanban size={15}/>:<FileText size={15}/>}</span>{child.title||'Без названия'}</button>)}</div>}</div><input className="title-input" value={note.title} placeholder="Название" onChange={event=>edit({...note,title:event.target.value})}/><textarea className="note-page-text" value={note.content} placeholder="Напишите что-нибудь…" onChange={event=>edit({...note,content:event.target.value})}/><PhotoGallery note={note} onChange={edit}/><DrawingPreview drawing={note.drawing}/><PhotoButton note={note} onChange={edit}/><PasswordButton note={note} onChange={setNote}/><DrawingButton key={note.id} drawing={note.drawing} onChange={drawing=>edit({...note,drawing})}/><button className="save" onClick={()=>void save().then(()=>navigate(-1))}>Закрыть</button>{historyOpen&&<NoteHistoryPanel note={note} onChange={setNote} onClose={()=>setHistoryOpen(false)}/>}</main>
}
