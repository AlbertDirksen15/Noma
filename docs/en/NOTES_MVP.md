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

## MVP 0.9 portable verification — 0.9.0-local.0

Build: `npm run build:portable`. Copy the complete generated `release/Noma-portable` folder: Noma.cmd, Noma.ps1, README_RUN.txt, dist/, server/. Generated artifacts are ignored by Git. Node.js 22.12+ or 24 LTS must be installed in PATH; no npm install is needed on the destination machine. This prepares EXE packaging but does not include a runtime or signed executable.

Launch Noma.cmd. Noma.ps1 is optional and subject to PowerShell execution policy. Repository launchers also work after npm run build. Browser opening is automatic; the server binds only to 127.0.0.1:3847. Occupied ports fall back to the next port; at 65535 Windows chooses a free port. NOMA_PORT overrides the initial port; invalid values are rejected.

Keep the terminal open. Ctrl+C gracefully stops the listener and allows active requests up to three seconds. Closing the browser does not stop the server. Missing dist/index.html reports a build instruction. Encoded traversal and symlinked files outside dist are rejected.

Data is stored in browser IndexedDB, not in the portable folder. Browser profile and port are part of the storage origin: a fallback port can appear empty. Return to the original port/profile or use Workspace Export/Import. Export before moving computers. Stop Noma before rebuilding. If Windows prevents cleanup, the builder may reuse the folder; inspect it before distributing.

Checks: npm run lint, npm run typecheck, npm test, npm run build, npm run build:portable. Tests cover port fallback/config, localhost binding, index/assets/SPA, traversal, missing output, graceful shutdown, copying real templates and stale asset removal. No push, tag or remote release is part of this checkpoint.
