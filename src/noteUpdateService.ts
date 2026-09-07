import { db, type Note } from './data';
export const updateNoteFields=async(id:string,fields:Partial<Note>)=>{const current=await db.notes.get(id);if(!current)throw new Error('Заметка не найдена');const updated={...current,...fields,updatedAt:Date.now()};await db.notes.put(updated);return updated};
