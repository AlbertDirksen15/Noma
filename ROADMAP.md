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
