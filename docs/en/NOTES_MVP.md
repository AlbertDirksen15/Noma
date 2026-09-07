# Notes MVP and Projects

Noma stores notes locally in IndexedDB through Dexie. A project is a universal `Note` with `isProject: true`; nested notes and projects use `parentId`.

Implemented: project routes, breadcrumbs, child note/project creation, direct note links, Move to root or another project, cycle protection, subtree archive/trash/restore, soft delete and permanent delete.

Time tracking is an optional capability on Notes and Projects. Sessions are persisted in IndexedDB, support Start/Pause/Resume/Stop, manual entries, totals and history. Only one timer may run globally.

Goals use persistent target hours and a fixed local calendar deadline. Pace is recalculated from remaining hours and inclusive calendar days. The compact UI shows the goal/deadline and remaining time, while the tracking block shows total time, time tracked today and required hours per day. Graphs, ahead/behind and forecast are intentionally outside MVP 0.5.
