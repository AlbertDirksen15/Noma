# Noma Release Notes

## v0.9.0-local.0 preparation

- Added Windows `Noma.cmd` and PowerShell `Noma.ps1` launchers.
- Added `npm run build:portable`, producing the ignored `release/Noma-portable/` folder.
- Portable output contains the production `dist/`, localhost server, launchers and `README_RUN.txt`.
- Node.js remains a runtime requirement; this is not a bundled, signed or installed `Noma.exe`.

## v0.8.0-local

This local checkpoint contains the completed MVP 0.3–0.8 implementation currently merged into `develop`.

The post-release stabilization work also includes a minimal local desktop launcher for the existing web frontend.

### Included

- Projects and nested notes.
- Persistent time tracking with totals, daily time and manual entries.
- Goals, deadlines and dynamic required pace.
- Pomodoro work-interval indicator integrated with tracking.
- Persistent Note version history with preview and restore.
- Versioned local workspace JSON export/import.
- Workspace and device identity metadata, schema versioning and tombstones.
- Local Backup/Restore UI.
- Local desktop mode through `npm run desktop`, using a localhost-only Node server on port `3847` with automatic fallback and browser opening.

### Known limitation

Google Drive upload to the visible `Google Drive / Noma/` folder is not enabled in this checkpoint because Google OAuth client configuration is missing. The private `appDataFolder` is not used.

### Verification

- lint: pass
- typecheck: pass
- tests: 70/70 pass
- build: pass

The launcher is not a native Windows EXE or installer yet; it keeps the existing browser UI and local-first data model unchanged.
