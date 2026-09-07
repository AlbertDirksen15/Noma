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

## MVP 0.9 portable verification — 0.9.0-local.0

Build: `npm run build:portable`. Copy the complete generated `release/Noma-portable` folder: Noma.cmd, Noma.ps1, README_RUN.txt, dist/, server/. Generated artifacts are ignored by Git. Node.js 22.12+ or 24 LTS must be installed in PATH; no npm install is needed on the destination machine. This prepares EXE packaging but does not include a runtime or signed executable.

Launch Noma.cmd. Noma.ps1 is optional and subject to PowerShell execution policy. Repository launchers also work after npm run build. Browser opening is automatic; the server binds only to 127.0.0.1:3847. Occupied ports fall back to the next port; at 65535 Windows chooses a free port. NOMA_PORT overrides the initial port; invalid values are rejected.

Keep the terminal open. Ctrl+C gracefully stops the listener and allows active requests up to three seconds. Closing the browser does not stop the server. Missing dist/index.html reports a build instruction. Encoded traversal and symlinked files outside dist are rejected.

Data is stored in browser IndexedDB, not in the portable folder. Browser profile and port are part of the storage origin: a fallback port can appear empty. Return to the original port/profile or use Workspace Export/Import. Export before moving computers. Stop Noma before rebuilding. If Windows prevents cleanup, the builder may reuse the folder; inspect it before distributing.

Checks: npm run lint, npm run typecheck, npm test, npm run build, npm run build:portable. Tests cover port fallback/config, localhost binding, index/assets/SPA, traversal, missing output, graceful shutdown, copying real templates and stale asset removal. No push, tag or remote release is part of this checkpoint.
