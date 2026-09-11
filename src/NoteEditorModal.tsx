import {useEffect, useRef, useState, type KeyboardEvent} from 'react';
import {Pin, Trash2} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {type Note, type NoteColor} from './data';
import {saveDraft, flushDrafts} from './noteEditing';
import {updateSubtree} from './treeRepository';
import {MoveToProject, NoteBreadcrumbs} from './NoteLocation';
import {TimeTrackingPanel} from './TimeTrackingPanel';
import NoteHistoryPanel from './NoteHistoryPanel';
import {PhotoButton, PhotoGallery} from './photos/Photos';
import PasswordButton, {UnlockNote} from './protection/PasswordButton';
import {forgetPassword, isLocked} from './protection/noteProtection';
import DrawingButton, {DrawingPreview} from './drawing/DrawingEditor';
import './noteEditorModal.css';

const colors:NoteColor[] = ['default', 'green', 'yellow', 'blue', 'pink', 'purple', 'gray'];
const colorLabels:Record<NoteColor, string> = {
  default: 'По умолчанию', green: 'Зелёный', yellow: 'Жёлтый', blue: 'Голубой',
  pink: 'Розовый', purple: 'Фиолетовый', gray: 'Серый',
};

// Both the workspace and project board mount this same editor and save flow.
export default function NoteEditorModal({note:initialNote, onClose}:{note:Note; onClose:()=>void|Promise<unknown>}) {
  const [note, setNote] = useState(initialNote);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const navigate = useNavigate();
  const closing = useRef(false);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement|null;
    return () => {
      void flushDrafts().then(() => forgetPassword(initialNote.id));
      if (previous?.isConnected) previous.focus();
    };
  }, [initialNote.id]);

  const save = async (updated:Note) => {
    setNote(updated);
    try {
      await saveDraft(updated);
      setSaveError('');
    } catch {
      setSaveError('Не удалось сохранить. Изменения сохранены в черновике этого браузера.');
    }
  };
  const close = async ():Promise<boolean> => {
    if (closing.current) return false;
    closing.current = true;
    try {
      if (!isLocked(note)) await saveDraft(note);
      await flushDrafts();
      forgetPassword(note.id);
      await onClose();
      return true;
    } catch {
      closing.current = false;
      setSaveError('Не удалось сохранить. Изменения сохранены в черновике этого браузера.');
      return false;
    }
  };
  const openLocation = async (path:string) => {
    if (await close()) navigate(path);
  };
  const remove = async () => {
    try {
      if (!isLocked(note)) await saveDraft(note);
      await flushDrafts();
      await updateSubtree(note.id, 'deletedAt', Date.now());
      forgetPassword(note.id);
      await onClose();
    } catch {
      setSaveError('Не удалось переместить заметку в корзину.');
    }
  };
  const handleKeys = (event:KeyboardEvent<HTMLDivElement>) => {
    // Photo/password dialogs render in portals and manage their own keyboard events.
    if (!event.currentTarget.contains(event.target as Node)) return;
    if (event.key === 'Tab') {
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not([type="hidden"]),textarea,summary,[tabindex="0"]'))
        .filter(element => !element.closest('[inert]') && element.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  };

  if (isLocked(note)) return <div className="overlay note-modal-overlay" role="dialog" aria-modal="true" aria-label="Защищённая заметка">
    <UnlockNote note={note} onChange={setNote} onClose={()=>void close()}/>
    {saveError && <p role="alert">{saveError}</p>}
  </div>;

  return <>
    <div className="overlay note-modal-overlay" onMouseDown={event=>{if(event.target===event.currentTarget)void close()}}>
      <div className={'editor note-editor-modal '+note.color} role="dialog" aria-modal="true" aria-label={note.isProject?'Редактор проекта':'Редактор заметки'} onKeyDown={handleKeys}>
        <div className="editor-scroll">
          <div className="note-modal-heading">
            <NoteBreadcrumbs note={note} onNavigate={path=>void openLocation(path)}/>
            <button className="icon note-modal-pin" aria-label={note.pinned?'Открепить':'Закрепить'} onClick={()=>void save({...note,pinned:!note.pinned})}>
              <Pin size={21} fill={note.pinned?'currentColor':'none'}/>
            </button>
          </div>
          {saveError && <p role="alert">{saveError}</p>}
          {!note.isProject && <TimeTrackingPanel key={note.id} note={note} compact onNoteChange={setNote}/>}
          <input className="title-input" autoFocus aria-label={note.isProject?'Название проекта':'Название заметки'} placeholder={note.isProject?'Название проекта':'Название'} value={note.title} onChange={event=>void save({...note,title:event.target.value})}/>
          {!note.isProject && <>
            <textarea aria-label="Текст заметки" placeholder="Напишите что-нибудь…" value={note.content} onChange={event=>void save({...note,content:event.target.value})}/>
            <PhotoGallery note={note} onChange={save}/>
            <div id={'drawing-slot-'+note.id} className="drawing-slot"><DrawingPreview drawing={note.drawing}/></div>
          </>}
          <div className="note-modal-utilities">
            <MoveToProject note={note} onChange={setNote}/>
            <button onClick={()=>void save({...note,inToday:!note.inToday})}>{note.inToday?'Убрать из плана':'Добавить в план на сегодня'}</button>
            <button onClick={()=>void save({...note,inInbox:!note.inInbox})}>{note.inInbox?'Убрать из «На обработку»':'В «На обработку»'}</button>
            <button onClick={()=>setHistoryOpen(true)}>История</button>
            <button onClick={()=>void openLocation((note.isProject?'/project/':'/note/')+note.id)}>{note.isProject?'Открыть доску':'Вложенные записи'}</button>
            <button onClick={()=>void remove()}><Trash2 size={14}/> В корзину</button>
          </div>
        </div>
        <div className="note-modal-footer">
          <div className="note-modal-media">
            {!note.isProject && <PhotoButton note={note} onChange={save} label="Картинка"/>}
            <PasswordButton note={note} onChange={setNote} label="Пароль"/>
            {!note.isProject && <DrawingButton targetId={'drawing-slot-'+note.id} drawing={note.drawing} onChange={drawing=>void save({...note,drawing})} label="Рисовать"/>}
          </div>
          <div className="note-modal-bottom">
            <div className="colors" role="group" aria-label="Цвет заметки">
              {colors.map(color=><button key={color} className={'dot '+color+(note.color===color?' selected':'')} title={colorLabels[color]} aria-label={colorLabels[color]} aria-pressed={note.color===color} onClick={()=>void save({...note,color})}/>)}
            </div>
            <button className="save" onClick={()=>void close()}>Закрыть</button>
          </div>
        </div>
      </div>
    </div>
    {historyOpen && <NoteHistoryPanel note={note} onChange={setNote} onClose={()=>setHistoryOpen(false)}/>}
  </>;
}
