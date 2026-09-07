# Noma — Master Specification

Noma is a local-first application for notes, projects, planning and time tracking. The source requirements are maintained in the project history and expanded incrementally. MVP 0.1 focuses on the first mandatory scenario: launch locally, create and edit a note, close, reopen, and retain the note locally.

## Principles

- Local-first and offline-first.
- User owns the data; no mandatory Noma backend.
- Universal Note model with progressive complexity.
- Simple default UI; advanced capabilities remain optional.
- Architecture should leave room for sync, mobile, plugins, themes and Steam packaging.

## Roadmap

0.1 notes and persistence; 0.2 today/inbox/archive/trash; 0.3 nested notes/projects (completed); 0.4 time tracking; 0.5 goals/deadlines and dynamic pace; 0.6 Pomodoro; 0.7 note version history and restore; 0.8 local workspace backup with a blocked Google Drive prototype; desktop local launcher stabilization; 1.0 Windows launcher packaging.

MVP 0.8 starts with a versioned local workspace JSON and visible Backup/Restore flow. The planned Drive location is the user-readable `Google Drive / Noma/` folder; private `appDataFolder` is intentionally excluded. Drive upload requires configured OAuth credentials.

## Later platforms

Android, iOS and Steam are post-desktop milestones. The core remains a local web UI served by a local process; platform-specific launchers or embedded views may be added later without changing the data model.

## Desktop local mode

The current desktop shell is intentionally minimal: `npm run desktop` builds the existing Vite frontend, serves `dist` from a Node HTTP server bound only to `127.0.0.1`, selects the next available port after `3847`, and opens the normal browser. It has no cloud backend, remote API or native UI. Windows EXE/installer packaging remains a later step.
