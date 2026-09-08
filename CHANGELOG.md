# Changelog

## Noma 1.0 Beta — 1.0.0-beta.0

- Added native `Noma.exe` as the primary Windows launcher.
- Bundled the Node.js runtime, so Node.js is no longer a destination-computer requirement.
- Added `npm run build:windows` as an alias for the portable Windows build.
- Kept Noma fully offline and localhost-only; executable signing and an installer are deferred.

## Noma 0.9 Beta — 0.9.0-local.0

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


## 2026-09-08 — Author credit

Added a subtle “Made by Albert D.” credit in the bottom-right corner across application views. Uses theme text color.
