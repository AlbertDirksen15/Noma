import { db, newNote, searchNotes, type Note } from './data';

export const createNote = (extra: Partial<Note> = {}) => db.notes.add(newNote(extra));
export const updateNote = (note: Note) => db.notes.put({ ...note, updatedAt: Date.now() });
export const archiveNote = (note: Note) => updateNote({ ...note, archivedAt: Date.now() });
export const restoreArchive = (note: Note) => updateNote({ ...note, archivedAt: null });
export const trashNote = (note: Note) => updateNote({ ...note, deletedAt: Date.now() });
export const restoreTrash = (note: Note) => updateNote({ ...note, deletedAt: null });
export const permanentlyDeleteNote = (id: string) => db.notes.delete(id);
export const visibleNotes = (notes: Note[]) => notes.filter(note => !note.archivedAt && !note.deletedAt);
export { searchNotes };
