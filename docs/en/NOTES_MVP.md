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

## Noma 1.0 Beta

`npm run build:windows` creates `release/Noma-portable/Noma.exe` and bundles its Node runtime beside the static UI. Double-click `Noma.exe` to run Noma offline without a separate Node.js installation. Keep the complete portable folder together. It is unsigned and has no installer yet.

For Windows portable output, run `npm run build:windows`. The ignored `release/Noma-portable/` folder contains `Noma.exe`, its bundled runtime, fallback launch scripts, `README_RUN.txt`, the production `dist/` and the local server. Node.js is not required on the destination computer.

## MVP 0.9 portable verification — 0.9.0-local.0

Build: `npm run build:portable`. Copy the complete generated `release/Noma-portable` folder: Noma.cmd, Noma.ps1, README_RUN.txt, dist/, server/. Generated artifacts are ignored by Git. Node.js 22.12+ or 24 LTS must be installed in PATH; no npm install is needed on the destination machine. This prepares EXE packaging but does not include a runtime or signed executable.

Launch Noma.cmd. Noma.ps1 is optional and subject to PowerShell execution policy. Repository launchers also work after npm run build. Browser opening is automatic; the server binds only to 127.0.0.1:3847. Occupied ports fall back to the next port; at 65535 Windows chooses a free port. NOMA_PORT overrides the initial port; invalid values are rejected.

Keep the terminal open. Ctrl+C gracefully stops the listener and allows active requests up to three seconds. Closing the browser does not stop the server. Missing dist/index.html reports a build instruction. Encoded traversal and symlinked files outside dist are rejected.

Data is stored in browser IndexedDB, not in the portable folder. Browser profile and port are part of the storage origin: a fallback port can appear empty. Return to the original port/profile or use Workspace Export/Import. Export before moving computers. Stop Noma before rebuilding. If Windows prevents cleanup, the builder may reuse the folder; inspect it before distributing.

Checks: npm run lint, npm run typecheck, npm test, npm run build, npm run build:portable. Tests cover port fallback/config, localhost binding, index/assets/SPA, traversal, missing output, graceful shutdown, copying real templates and stale asset removal. No push, tag or remote release is part of this checkpoint.


## 2026-09-08

Notes save automatically as you type. Pin cards and drag them to reorder within pinned or unpinned groups. Today includes Current tasks and Recurring tasks. Goals may omit a date. Collapsing the timer pauses it; Reset preserves tracked history. Project creation is in the sidebar. Theme tokens and core services prepare future plugin/theme separation; see ../EXTENSIBILITY.md.


## 2026-09-08 — Timer controls refinement

The small drawer indicator is filled green for both running and paused open sessions; collapse still pauses tracking. Reset total time is directly below Total. It resets the displayed counter using per-session totalExcludedMs metadata, preserving history, goal progress, today totals and timer state. Reset timer moved into the Pomodoro dots menu alongside a separately labelled Reset Pomodoro. The expanded drawer allows the settings menu to remain fully visible.

The reset command belongs to trackingRepository; the UI invokes it and theme CSS owns indicator styling. Existing backups remain compatible: omitted totalExcludedMs means zero; exports preserve reset metadata. Validation: lint/typecheck/build pass, 87 tests pass; browser verifies green paused indicator, total reset and timer reset from the menu.


## 2026-09-08 — Drawing in notes

Added a minimal pen-in-circle action at the bottom of note editors, including project notes. The separate drawing editor provides pencil, pen, translucent marker, stroke eraser, color and width controls, undo/redo and Done. Mouse, touch and pen use Pointer Events. Vector strokes autosave through the existing note service during drawing and at stroke completion; previews appear in notes, cards and revision history. Drawing data round-trips through workspace backup/import. Old notes without drawing fields remain compatible.

The versioned drawing model and geometric operations live in src/drawing/model.ts; UI and theme styling are separate. No plugin runtime is introduced. Eraser removes a whole touched stroke and can be undone; pressure-sensitive brushes and standalone image export are outside this increment. Browser checked pen/marker strokes, undo/redo, eraser and reload recovery. Tests: 92/92.


## 2026-09-08 — Note passwords

A minimal lock action beside drawing sets any nonempty password with no length, character or complexity rules. Unlocking is required to read/edit protected content. The unlocked note can change/remove its password or lock again; closing the note forgets its session key. Passwords are never stored.

The core protection service uses Web Crypto AES-256-GCM with random IVs, per-note salts and PBKDF2-SHA-256 (210000 iterations). Title, text and drawing are encrypted in IndexedDB and existing/new revision snapshots, and remain encrypted in JSON backups. The pending plaintext draft journal is bypassed for protected content. Metadata (color, hierarchy, planning flags, goal/time records and manual tracking comments) stays separate; child notes have independent protection. Earlier external backups cannot be retroactively protected. No password recovery exists.

Protection is a core data service separate from UI and theme styles, not a plugin-specific storage path. Tests cover weak/Unicode/whitespace passwords, wrong-password rejection, encrypted edits/history, rotation/removal and backup round-trip. 99 tests pass. Browser checked the bottom lock icon and password dialog layout; credential lifecycle was verified with isolated automated tests.


## 2026-09-08 — Photos and photo trash

Notes and projects accept multiple local image files through the compact photo button. Supported formats are JPEG, PNG, WebP, GIF, AVIF and BMP. Photos appear as previews; clicking a preview opens the full image. Each preview has a trash icon in its upper-right corner. Removing a photo is recoverable: the photo is marked deleted and appears in the application's Trash view. Restore brings back the original photo; Clear photo trash permanently removes trashed photo data and its revision copies after confirmation.

Photos are stored as data URLs with name, MIME type, dimensions and timestamps. Note updates, autosave, revisions and workspace JSON carry photo metadata. Protected notes encrypt photos with the same AES-GCM envelope as title, content and drawings. Photo trash does not delete the parent note or tracking history. Old notes without photos remain compatible.

Validation: 105/105 tests pass, including photo trash restore/purge, encrypted photos and backup round trip. Browser checks covered the Add photo control and photo preview rendering.
