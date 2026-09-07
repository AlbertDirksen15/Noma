import { db, newNote, searchNotes, type Note } from './data';
import { stopActiveForNote } from './trackingRepository';
import { updateNoteFields } from './noteUpdateService';
import { deleteRevisionsForNote } from './noteRevisionRepository';

export const createNote = (extra: Partial<Note> = {}) => db.notes.add(newNote(extra));
export const updateNote = async (note: Note) => {
  const { goalEnabled: _goalEnabled, targetHours: _targetHours, deadline: _deadline, goalStartDate: _goalStartDate, actualHoursAtGoalStart: _actualHoursAtGoalStart, goalUpdatedAt: _goalUpdatedAt, ...fields } = note;
  return updateNoteFields(note.id, fields);
};
export const archiveNote = async (note: Note) => { await stopActiveForNote(note.id); return updateNoteFields(note.id,{archivedAt:Date.now()}); };
export const restoreArchive = (note: Note) => updateNoteFields(note.id,{archivedAt:null});
export const trashNote = async (note: Note) => { await stopActiveForNote(note.id); return updateNoteFields(note.id,{deletedAt:Date.now()}); };
export const restoreTrash = (note: Note) => updateNoteFields(note.id,{deletedAt:null});
export const permanentlyDeleteNote = (id: string) => db.transaction('rw',db.notes,db.noteRevisions,async()=>{await deleteRevisionsForNote(id);await db.notes.delete(id)});
export const visibleNotes = (notes: Note[]) => notes.filter(note => !note.archivedAt && !note.deletedAt);
export const todayNotes = (notes: Note[]) => visibleNotes(notes).filter(note => note.inToday);
export { searchNotes };
