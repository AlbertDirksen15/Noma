# Notes MVP and Projects

Noma stores notes locally in IndexedDB through Dexie. A project is a universal `Note` with `isProject: true`; nested notes and projects use `parentId`.

Implemented: project routes, breadcrumbs, child note/project creation, direct note links, Move to root or another project, cycle protection, subtree archive/trash/restore, soft delete and permanent delete.
