# Changelog

## 0.9.0-local.0

- Added Windows-friendly `Noma.cmd` and `Noma.ps1` launchers.
- Added `npm run build:portable` for an ignored `release/Noma-portable/` folder.
- Added portable run instructions and coverage for launcher source files.
- Kept the server localhost-only and retained the browser-based local-first architecture.

## Unreleased

- Added a minimal localhost-only desktop launcher for the existing production frontend.
- Added automatic fallback to the next available port after `3847` and optional browser opening.
- Added tests for static serving, SPA fallback, and occupied-port handling.

## 0.8.0

- Added versioned workspace JSON export/import for Notes, tracking sessions, revisions and tombstones.
- Added workspace/device identity and schema version metadata in Dexie.
- Added local Backup/Restore UI.
- Selected visible `Google Drive / Noma/` storage; Drive upload is blocked until OAuth credentials are configured.

## 0.7.0

- Added persistent snapshot-based history for significant Note and Project changes.
- Added compact History panels with revision preview, full restore and title/content-only restore.
- Revisions coalesce over a three-minute edit window and retain the latest 100 versions per Note.
- Archive/Trash restore remains lifecycle recovery and is intentionally separate from Version Restore.
- Permanent note and subtree deletion now removes associated revisions.

## 0.6.0

- Added persistent Pomodoro work-interval state with a compact SVG progress ring.
- Pomodoro completion is a visual rhythm signal and never pauses or stops tracked time.

## 0.5.0

- Added migrated goal fields for Notes and Projects.
- Added persistent target hours and deadlines with edit/delete controls.
- Added total tracked time, tracked today and dynamic required hours/day in the tracking block.
- Added canonical goal-safe Note save flow across embedded, Note and Project editors.
- Plan-vs-actual graph, ahead/behind and forecast are intentionally out of scope for MVP 0.5.

## 0.4.0

- Added optional persistent time tracking for Notes and Projects.
- Added timestamp-based sessions, one-active-timer enforcement, manual entries, totals, history and archive/trash safety.

## 0.3.0

- Added universal project notes and nested notes/projects.
- Added project and note deep links, breadcrumbs and move dialog.
- Added cycle protection and subtree archive/trash/restore behavior.
