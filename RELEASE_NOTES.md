# Noma Release Notes

## Noma 1.0 Beta — v1.0.0-beta.0

- Double-click `Noma.exe` in the portable folder to start Noma without a separate Node.js installation.
- The complete portable folder must remain together: `Noma.exe`, `runtime/`, `server/` and `dist/`.
- Noma remains an offline local browser application. The executable is not signed and no Windows installer is included yet.

## Noma 0.9 Beta — v0.9.0-local.0

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
