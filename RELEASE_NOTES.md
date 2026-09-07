# Noma Release Notes

## v0.8.0-local

This local checkpoint contains the completed MVP 0.3–0.8 implementation currently merged into `develop`.

### Included

- Projects and nested notes.
- Persistent time tracking with totals, daily time and manual entries.
- Goals, deadlines and dynamic required pace.
- Pomodoro work-interval indicator integrated with tracking.
- Persistent Note version history with preview and restore.
- Versioned local workspace JSON export/import.
- Workspace and device identity metadata, schema versioning and tombstones.
- Local Backup/Restore UI.

### Known limitation

Google Drive upload to the visible `Google Drive / Noma/` folder is not enabled in this checkpoint because Google OAuth client configuration is missing. The private `appDataFolder` is not used.

### Verification

- lint: pass
- typecheck: pass
- tests: 68/68 pass
- build: pass
