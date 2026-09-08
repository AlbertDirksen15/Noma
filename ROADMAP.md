# Noma Roadmap

## Completed

- Notes MVP: local notes, search, Today, Inbox, Archive and Trash.
- MVP 0.3: projects and nested notes.
- MVP 0.4: persistent time tracking.
- MVP 0.5: goals, deadlines, dynamic pace and compact tracking integration. Advanced analytics remain out of scope.
- MVP 0.6: IMPLEMENTATION COMPLETE / MANUAL VERIFICATION PARTIAL — Pomodoro work-interval rhythm integrated with tracking.
- MVP 0.7: IMPLEMENTATION COMPLETE / MANUAL VERIFICATION PARTIAL — persistent Note version history, preview, restore and copy text from a prior version.

## MVP 0.8

- LOCAL BACKUP/RESTORE COMPLETE — versioned workspace JSON export/import with Notes, tracking sessions, revisions and tombstones.
- Local Backup/Restore UI.
- Planned visible Google Drive folder: `Google Drive / Noma/`; private `appDataFolder` is out of scope.
- GOOGLE DRIVE BLOCKED BY OAUTH — upload remains blocked until OAuth client credentials are configured.

## MVP 0.9 — Windows portable launcher preparation

- Implemented a minimal Node static server for the existing Vite build.
- Binds to localhost only, defaults to port `3847`, falls back to the next free port and can open the normal browser.
- `npm run build:portable` creates an ignored `release/Noma-portable/` folder with Windows launchers, docs, `dist/` and the server script.
- Native Windows EXE/installer packaging remains a later step; Node.js is required for this portable launcher.

## Next

- MVP 1.0: COMPLETE — portable `Noma.exe` with an included Node runtime; signing and an installer remain future work.
- MVP 1.1: Themes & Plugin Foundation — declarative theme packages, plugin
  manifests, the first safe actions/filters and an extension-management screen.

## MVP 0.4 Definition of Done

- Optional tracking capability on every Note and Project.
- Persistent timestamp-based Start, Pause, Resume and Stop sessions.
- One active timer, manual entries, totals and history.
- Archive/trash stop active sessions while restore preserves history.

## MVP 0.9 portable verification — 0.9.0-local.0

Build: `npm run build:portable`. Copy the complete generated `release/Noma-portable` folder: Noma.cmd, Noma.ps1, README_RUN.txt, dist/, server/. Generated artifacts are ignored by Git. Node.js 22.12+ or 24 LTS must be installed in PATH; no npm install is needed on the destination machine. This prepares EXE packaging but does not include a runtime or signed executable.

Launch Noma.cmd. Noma.ps1 is optional and subject to PowerShell execution policy. Repository launchers also work after npm run build. Browser opening is automatic; the server binds only to 127.0.0.1:3847. Occupied ports fall back to the next port; at 65535 Windows chooses a free port. NOMA_PORT overrides the initial port; invalid values are rejected.

Keep the terminal open. Ctrl+C gracefully stops the listener and allows active requests up to three seconds. Closing the browser does not stop the server. Missing dist/index.html reports a build instruction. Encoded traversal and symlinked files outside dist are rejected.

Data is stored in browser IndexedDB, not in the portable folder. Browser profile and port are part of the storage origin: a fallback port can appear empty. Return to the original port/profile or use Workspace Export/Import. Export before moving computers. Stop Noma before rebuilding. If Windows prevents cleanup, the builder may reuse the folder; inspect it before distributing.

Checks: npm run lint, npm run typecheck, npm test, npm run build, npm run build:portable. Tests cover port fallback/config, localhost binding, index/assets/SPA, traversal, missing output, graceful shutdown, copying real templates and stale asset removal. No push, tag or remote release is part of this checkpoint.


## 2026-09-08 — Notes UX and extension boundaries

Immediate note autosave with a browser recovery journal; Close replaces Save and a pin replaces the editor cross. Cards support persistent drag ordering within pinned/unpinned groups; pinned notes precede new cards. Today starts with Current tasks and Recurring tasks (Russian labels in the app). Goals support optional deadlines. The top timer drawer pauses running work when collapsed; resetting completes the current session without deleting tracked history. Sidebar uses consistent icons and soft selection. Project creation is in the sidebar; duplicate project strips and broken flex page layout were removed.

Theme tokens live in src/themes/default.css; navigation metadata in src/core/navigation.ts. Core services retain data ownership. See docs/EXTENSIBILITY.md for the WordPress-inspired future actions, filters, slots and theme boundaries. No plugin runtime/SDK is implemented.

Validation: 83 tests, lint/typecheck and production build pass. Browser checks cover reload autosave, timer collapse/pause/reset, undated goals and project layout. Existing portable runtime is locked; an updated portable copy is prepared separately. Existing uncommitted desktop-server changes are preserved outside this UX commit.


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


## 2026-09-08 — Project versus note clarity

The UI now explains the distinction everywhere it matters: a note is labelled “Заметка · запись” and a project “Проект · папка”. Project pages include an explainer that projects contain notes and subprojects, plus a “Содержимое проекта” section with its item count. Children are labelled “Заметка” or “Подпроект”. The data model remains compatible: both are Note records and isProject controls the container behavior, preserving the future plugin/content-block boundary.


## 2026-09-08 — Nested notes and tree-wide goals

Any note can now contain notes and subprojects. Note pages show breadcrumbs for mixed parent chains and a “Вложенные записи” section with quick links and actions for a child note or subproject. Project breadcrumbs also navigate correctly when a parent is a note.

Goals aggregate tracking sessions across the full descendant tree (notes and projects). The goal panel shows hours already tracked inside the tree, remaining hours and required hours per day when a date is selected. The pace is never capped at 24 hours; values such as 29.7 h/day are shown directly. Goal baseline creation includes existing descendant sessions.

Validation: 107/107 tests pass, lint/typecheck/build pass. New tests cover notes inside notes, mixed breadcrumbs, nested goal baselines and over-24-hour pace behavior.


## 2026-09-08 — Goal persistence in note editors

Goal saves now propagate the updated note back to the parent editor state as well as IndexedDB. This prevents a later autosave from displaying stale goal fields and makes target hours/date immediately durable for ordinary notes and projects.
