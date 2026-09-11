import {useEffect, useState} from 'react';
import {liveQuery} from 'dexie';
import {ArrowLeft, Pin, FolderKanban, FileText, MoreVertical, Plus} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';
import {db, type Note} from './data';
import {MoveToProject, NoteBreadcrumbs} from './NoteLocation';
import {NoteTimeBadge} from './TimeSummary';
import TrackingDot from './TrackingDot';
import {PhotoPreview} from './photos/Photos';
import {DrawingPreview} from './drawing/DrawingEditor';
import {updateNoteFields} from './noteUpdateService';
import {UnlockNote} from './protection/PasswordButton';
import {isLocked, forgetPassword} from './protection/noteProtection';
import {saveDraft, flushDrafts, orderNotes, reorderNotes} from './noteEditing';
import NoteHistoryPanel from './NoteHistoryPanel';
import NoteEditorModal from './NoteEditorModal';
import {createChildNote, createChildProject, updateSubtree} from './treeRepository';
import {projectTabClass, projectTabStyle} from './core/projectStyle';
import {TimeTrackingPanel} from './TimeTrackingPanel';
import './projectBoard.css';

export default function ProjectView() {
  const id = useLocation().pathname.split('/')[2], navigate = useNavigate();
  const [project, setProject] = useState<Note>();
  const [children, setChildren] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note|null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    void db.notes.get(id).then(setProject);
    const subscription = liveQuery(() => db.notes.toArray()).subscribe(all => {
      setChildren(all.filter(note => note.parentId===id && !note.deletedAt && !note.archivedAt));
    });
    return () => { subscription.unsubscribe(); void flushDrafts().then(()=>forgetPassword(id)); };
  }, [id]);

  if (!project) return <section className="project-content"><button onClick={()=>navigate('/projects')}>Все проекты</button><h1>Проект не найден</h1></section>;
  if (isLocked(project)) return <UnlockNote note={project} onChange={setProject} onClose={()=>navigate('/')}/>;

  const openChild = (child:Note) => {
    if (child.isProject) navigate('/project/'+child.id);
    else setActiveNote(child);
  };
  const addNote = async () => {
    const childId = await createChildNote(project.id);
    const child = await db.notes.get(childId);
    if (child) setActiveNote(child);
  };

  return <section className="project-content project-board">
    <div className="project-topbar">
      <button className="back" onClick={()=>navigate('/projects')}><ArrowLeft size={17}/> Все проекты</button>
      <div className="note-page-actions project-toolbar" role="group" aria-label="Создание в проекте">
        <button onClick={()=>void addNote()}><Plus size={15}/> Новая заметка</button>
        <span className="action-divider" aria-hidden="true"/>
        <button onClick={async()=>navigate('/project/'+await createChildProject(project.id))}><Plus size={15}/> Новый проект</button>
      </div>
    </div>
    <NoteBreadcrumbs note={project}/>
    <div className="project-board-heading">
      <div className="project-board-title">
        <h1><button className="project-description-link" title="Описание проекта" onClick={()=>navigate(`/project/${project.id}/description`)}>{project.title||'Без названия'}</button></h1>
        <p>{children.length} {children.length===1?'запись':'записей'} · Вложенные заметки и проекты</p>
      </div>
      <details className="compact-menu project-menu">
        <summary aria-label="Действия проекта" title="Действия проекта"><MoreVertical size={21}/></summary>
        <div className="compact-menu-panel">
          <button onClick={()=>{const updated={...project,pinned:!project.pinned};setProject(updated);void saveDraft(updated)}}><Pin size={16} fill={project.pinned?'currentColor':'none'}/>{project.pinned?'Открепить проект':'Закрепить проект'}</button>
          <button onClick={()=>setHistoryOpen(true)}>История</button>
          <button onClick={()=>{if(confirm('Архивировать проект и вложенные заметки?'))void updateSubtree(id,'archivedAt',Date.now()).then(()=>navigate('/archive'))}}>Архивировать проект</button>
          <button onClick={()=>{if(confirm('Переместить проект и вложенные заметки в корзину?'))void updateSubtree(id,'deletedAt',Date.now()).then(()=>navigate('/trash'))}}>Проект в корзину</button>
        </div>
      </details>
    </div>
    <div className="project-board-metrics"><TimeTrackingPanel key={project.id} note={project} compact onNoteChange={setProject}/></div>
    <div className="grid project-board-grid">
      {orderNotes(children).map(child=><article key={child.id} draggable tabIndex={0} aria-label={child.title||'Без названия'}
        onDragStart={event=>event.dataTransfer.setData('text/plain',child.id)} onDragOver={event=>event.preventDefault()}
        onDrop={event=>{event.preventDefault();void reorderNotes(children,event.dataTransfer.getData('text/plain'),child.id)}}
        style={child.isProject?projectTabStyle(child.id):undefined}
        className={'card '+child.color+(child.isProject?' project-card '+projectTabClass(child.id):'')}
        onClick={()=>openChild(child)} onKeyDown={event=>{if(event.target===event.currentTarget&&(event.key==='Enter'||event.key===' ')){event.preventDefault();openChild(child)}}}>
        <button className="pin-button" aria-label={child.pinned?'Открепить':'Закрепить'} onClick={event=>{event.stopPropagation();void updateNoteFields(child.id,{pinned:!child.pinned})}}><Pin size={18} fill={child.pinned?'currentColor':'none'}/></button>
        <div className="card-kind">{child.isProject?<><FolderKanban size={14}/> Подпроект</>:<><FileText size={14}/> Заметка</>}</div>
        <h3>{child.title||'Без названия'}<TrackingDot noteId={child.id}/></h3>
        <NoteTimeBadge note={child}/>
        <p>{child.content||'Начните писать…'}</p>
        <PhotoPreview photos={child.photos}/>
        <DrawingPreview drawing={child.drawing}/>
        <div className="card-foot">
          <span>{new Date(child.updatedAt).toLocaleDateString('ru-RU')}</span>
          <details className="compact-menu card-menu" onClick={event=>event.stopPropagation()}>
            <summary aria-label={'Действия: '+(child.title||'Без названия')} title="Действия записи"><MoreVertical size={18}/></summary>
            <div className="compact-menu-panel"><MoveToProject note={child} onChange={()=>{}}/></div>
          </details>
        </div>
      </article>)}
    </div>
    {activeNote && <NoteEditorModal key={activeNote.id} note={activeNote} onClose={()=>setActiveNote(null)}/>}
    {historyOpen && <NoteHistoryPanel note={project} onChange={setProject} onClose={()=>setHistoryOpen(false)}/>}
  </section>;
}
