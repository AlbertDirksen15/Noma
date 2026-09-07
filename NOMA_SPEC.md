# Noma — Master Specification

Noma is a local-first application for notes, projects, planning and time tracking. The source requirements are maintained in the project history and expanded incrementally. MVP 0.1 focuses on the first mandatory scenario: launch locally, create and edit a note, close, reopen, and retain the note locally.

## Principles

- Local-first and offline-first.
- User owns the data; no mandatory Noma backend.
- Universal Note model with progressive complexity.
- Simple default UI; advanced capabilities remain optional.
- Architecture should leave room for sync, mobile, plugins, themes and Steam packaging.

## Roadmap

0.1 notes and persistence; 0.2 today/inbox/archive/trash; 0.3 nested notes/projects (completed); 0.4 time tracking; 0.5 goals/deadlines and dynamic pace; 0.6 Pomodoro; 0.7 note version history and restore; 0.8 local workspace backup with a blocked Google Drive prototype; 0.9 Windows portable launcher preparation; 1.0 Windows launcher packaging.

MVP 0.8 starts with a versioned local workspace JSON and visible Backup/Restore flow. The planned Drive location is the user-readable `Google Drive / Noma/` folder; private `appDataFolder` is intentionally excluded. Drive upload requires configured OAuth credentials.

## Later platforms

Android, iOS and Steam are post-desktop milestones. The core remains a local web UI served by a local process; platform-specific launchers or embedded views may be added later without changing the data model.

## Desktop local mode

The current desktop shell is intentionally minimal: `npm run desktop` builds the existing Vite frontend, serves `dist` from a Node HTTP server bound only to `127.0.0.1`, selects the next available port after `3847`, and opens the normal browser. It has no cloud backend, remote API or native UI. Windows EXE/installer packaging remains a later step.

MVP 0.9 adds `npm run build:portable`, which creates an ignored `release/Noma-portable/` folder containing `Noma.cmd`, `Noma.ps1`, `README_RUN.txt`, `dist/` and the server script. The portable launcher requires an installed Node.js runtime.

## MVP 0.9 portable verification — 0.9.0-local.0

Build: `npm run build:portable`. Copy the complete generated `release/Noma-portable` folder: Noma.cmd, Noma.ps1, README_RUN.txt, dist/, server/. Generated artifacts are ignored by Git. Node.js 22.12+ or 24 LTS must be installed in PATH; no npm install is needed on the destination machine. This prepares EXE packaging but does not include a runtime or signed executable.

Launch Noma.cmd. Noma.ps1 is optional and subject to PowerShell execution policy. Repository launchers also work after npm run build. Browser opening is automatic; the server binds only to 127.0.0.1:3847. Occupied ports fall back to the next port; at 65535 Windows chooses a free port. NOMA_PORT overrides the initial port; invalid values are rejected.

Keep the terminal open. Ctrl+C gracefully stops the listener and allows active requests up to three seconds. Closing the browser does not stop the server. Missing dist/index.html reports a build instruction. Encoded traversal and symlinked files outside dist are rejected.

Data is stored in browser IndexedDB, not in the portable folder. Browser profile and port are part of the storage origin: a fallback port can appear empty. Return to the original port/profile or use Workspace Export/Import. Export before moving computers. Stop Noma before rebuilding. If Windows prevents cleanup, the builder may reuse the folder; inspect it before distributing.

Checks: npm run lint, npm run typecheck, npm test, npm run build, npm run build:portable. Tests cover port fallback/config, localhost binding, index/assets/SPA, traversal, missing output, graceful shutdown, copying real templates and stale asset removal. No push, tag or remote release is part of this checkpoint.
