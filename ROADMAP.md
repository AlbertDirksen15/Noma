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

## Desktop local launcher

- Implemented a minimal Node static server for the existing Vite build.
- Binds to localhost only, defaults to port `3847`, falls back to the next free port and can open the normal browser.
- Native Windows EXE/installer packaging remains outside this stabilization step.

## Next

- MVP 0.9: after MVP 0.8 scope is complete.

## MVP 0.4 Definition of Done

- Optional tracking capability on every Note and Project.
- Persistent timestamp-based Start, Pause, Resume and Stop sessions.
- One active timer, manual entries, totals and history.
- Archive/trash stop active sessions while restore preserves history.
