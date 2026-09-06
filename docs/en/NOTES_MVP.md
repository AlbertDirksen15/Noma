# Notes MVP and Projects

Noma stores notes locally in IndexedDB through Dexie. A project is a universal `Note` with `isProject: true`; nested notes and projects use `parentId`.

Implemented: project routes, breadcrumbs, child note/project creation, direct note links, Move to root or another project, cycle protection, subtree archive/trash/restore, soft delete and permanent delete.

Time tracking is an optional capability on Notes and Projects. Sessions are persisted in IndexedDB, support Start/Pause/Resume/Stop, manual entries, totals and history. Only one timer may run globally.
