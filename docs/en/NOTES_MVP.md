# Notes MVP and Projects

Noma stores notes locally in IndexedDB through Dexie. A project is a universal `Note` with `isProject: true`; nested notes and projects use `parentId`.

Implemented: project routes, breadcrumbs, child note/project creation, direct note links, Move to root or another project, cycle protection, subtree archive/trash/restore, soft delete and permanent delete.

Time tracking is an optional capability on Notes and Projects. Sessions are persisted in IndexedDB, support Start/Pause/Resume/Stop, manual entries, totals and history. Only one timer may run globally.

Goals use persistent target hours and a fixed local calendar deadline. Pace is recalculated from remaining hours and inclusive calendar days. The compact UI shows the goal/deadline and remaining time, while the tracking block shows total time, time tracked today and required hours per day. Graphs, ahead/behind and forecast are intentionally outside MVP 0.5.

## Note Version History (MVP 0.7)

Noma keeps persistent snapshots before meaningful Note or Project changes: title, content, color, Today/Inbox, parent location, tracking capability, Pomodoro setting and goal fields. Repeated autosaves share a three-minute edit window, and the latest 100 revisions per Note are retained. History previews a revision and can either restore the complete Note state or copy only its title and content. Version Restore keeps the same Note id and tracking sessions; if the historical parent is unavailable or unsafe, the current safe parent is retained. Trash/Archive Restore is separate lifecycle recovery, not version restoration.
