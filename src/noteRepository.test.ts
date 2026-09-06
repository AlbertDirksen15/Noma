import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, newNote } from './data';
import { archiveNote, createNote, permanentlyDeleteNote, restoreArchive, restoreTrash, searchNotes, trashNote, updateNote, visibleNotes } from './noteRepository';

beforeEach(async () => { await db.notes.clear(); });
describe('note repository lifecycle', () => {
  it('creates and updates a note', async () => { const id = await createNote(); const note = (await db.notes.get(id))!; expect(note.title).toBe(''); const updated = { ...note, title: 'English' }; await updateNote(updated); expect((await db.notes.get(id))!.title).toBe('English'); });
  it('persists Today and Inbox flags', async () => { const note = newNote({ inToday: true, inInbox: true }); await db.notes.add(note); expect((await db.notes.get(note.id))!.inToday).toBe(true); await updateNote({ ...note, inToday: false, inInbox: false }); expect((await db.notes.get(note.id))!.inInbox).toBe(false); });
  it('archives and restores without copying', async () => { const note = newNote({ title: 'A', inToday: true }); await db.notes.add(note); await archiveNote(note); const archived = (await db.notes.get(note.id))!; expect(visibleNotes([archived])).toHaveLength(0); await restoreArchive(archived); expect((await db.notes.get(note.id))!.archivedAt).toBeNull(); });
  it('trashes, restores and permanently deletes', async () => { const note = newNote(); await db.notes.add(note); await trashNote(note); const trashed = (await db.notes.get(note.id))!; expect(visibleNotes([trashed])).toHaveLength(0); await restoreTrash(trashed); expect((await db.notes.get(note.id))!.deletedAt).toBeNull(); await trashNote(note); await permanentlyDeleteNote(note.id); expect(await db.notes.get(note.id)).toBeUndefined(); });
  it('searches title/content case-insensitively', () => { const notes = [newNote({ title: 'English', content: 'Grammar book' }), newNote({ title: 'SQL', content: 'Queries' })]; expect(searchNotes(notes, 'ENGLISH')).toHaveLength(1); expect(searchNotes(notes, 'GRAMMAR')).toHaveLength(1); });
});
