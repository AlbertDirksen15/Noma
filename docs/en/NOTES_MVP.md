# Notes MVP and Projects

Noma stores notes locally in IndexedDB through Dexie. A project is a universal `Note` with `isProject: true`; nested notes and projects use `parentId`.

Implemented: project routes, breadcrumbs, child note/project creation, direct note links, Move to root or another project, cycle protection, subtree archive/trash/restore, soft delete and permanent delete.

Time tracking is an optional capability on Notes and Projects. Sessions are persisted in IndexedDB, support Start/Pause/Resume/Stop, manual entries, totals and history. Only one timer may run globally.

Goals use persistent target hours and a fixed local calendar deadline. Pace is recalculated from remaining hours and inclusive calendar days. The compact UI shows the goal/deadline and remaining time, while the tracking block shows total time, time tracked today and required hours per day. Graphs, ahead/behind and forecast are intentionally outside MVP 0.5.

## Note Version History (MVP 0.7)

Noma keeps persistent snapshots before meaningful Note or Project changes: title, content, color, Today/Inbox, parent location, tracking capability, Pomodoro setting and goal fields. Repeated autosaves share a three-minute edit window, and the latest 100 revisions per Note are retained. History previews a revision and can either restore the complete Note state or copy only its title and content. Version Restore keeps the same Note id and tracking sessions; if the historical parent is unavailable or unsafe, the current safe parent is retained. Trash/Archive Restore is separate lifecycle recovery, not version restoration.

## Workspace Backup (MVP 0.8)

The local workspace can be exported and restored as a versioned JSON file containing Notes, tracking sessions, revisions and tombstones, together with workspace/device identity. The planned Drive destination is the visible user-owned `Google Drive / Noma/` folder; `appDataFolder` is not used. Drive upload remains unavailable until OAuth credentials are configured.

## Desktop local mode

`npm run desktop` builds the existing frontend, serves it through a Node server bound only to `127.0.0.1:3847` (or the next free port), and opens the normal browser. `npm run desktop:serve` serves without opening a browser. This is not a cloud backend or native EXE packaging.

For Windows portable output, run `npm run build:portable`. The ignored `release/Noma-portable/` folder contains `Noma.cmd`, `Noma.ps1`, `README_RUN.txt`, the production `dist/` and the local server. Node.js must be installed; a bundled `Noma.exe` is a future packaging step.
