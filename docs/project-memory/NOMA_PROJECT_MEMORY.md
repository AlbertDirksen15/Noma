# Noma Project Memory

## What is Noma

Noma is a local-first personal productivity app built around universal notes. It combines notes, projects, nested notes, time tracking, goals, workspace backup/restore, and a lightweight desktop local mode.

## Core philosophy

- Capture now, organize later.
- The user owns the data.
- No required cloud backend.
- Google Keep-like simplicity.
- Keep the core extensible for later plugins, themes, sync and platform shells.
- Noma Core is GPL-3.0-or-later and will follow a WordPress-style extension
  model: themes and plugins extend Core through documented APIs, not edits to
  Core files.

## UI and design

- Light, warm yellow aesthetic.
- Card-based layout with compact panels.
- No heavy dashboard.
- Optional features stay hidden or collapsed unless enabled.
- Pomodoro is a small SVG circular ring beside the main timer.

## Current MVP status

- MVP 0.1–0.5: COMPLETE.
- MVP 0.6 Pomodoro: IMPLEMENTATION COMPLETE / MANUAL VERIFICATION PARTIAL.
- MVP 0.7 Version History: IMPLEMENTATION COMPLETE / MANUAL VERIFICATION PARTIAL.
- MVP 0.8 Local Backup/Restore: COMPLETE; Google Drive is blocked by missing OAuth configuration.
- MVP 0.9 Windows portable launcher preparation: COMPLETE.
- MVP 1.0 portable Noma.exe: IMPLEMENTATION COMPLETE; executable signing and an installer remain future work.
- Current release name: `Noma 1.0 Beta` (`1.0.0-beta.0`).

## Implemented features

- Notes, search and universal Note records.
- Projects and nested notes.
- Today and Inbox.
- Archive and Trash with restore.
- Persistent Time Tracking and manual entries.
- Goals with target hours, deadline and required hours per day.
- Pomodoro work intervals.
- Note Version History with preview and restore.
- Versioned Workspace Export/Import.
- Workspace/device metadata and tombstones.
- Local Backup/Restore UI.
- Local desktop launcher with localhost serving, port fallback and browser opening.
- Windows portable folder build with `Noma.cmd`, `Noma.ps1`, `README_RUN.txt`, `dist/` and the local server.

## Important product decisions

- Use the visible `Google Drive / Noma/` folder, not `appDataFolder`.
- Build backup/restore before automatic sync.
- Never fake Google Drive without a real OAuth Client ID.
- No automatic two-way sync yet.
- Time Tracking is the source of truth for real work time.
- Pomodoro is only a rhythm indicator and must not automatically stop main tracking.

## Pomodoro logic

- A small SVG progress ring sits beside the main timer.
- Red means an active work interval.
- Green with a soft pulse means the interval is complete.
- The main timer continues after Pomodoro completion.
- Break is not a fixed countdown.
- A new cycle starts manually.
- Stop resets Pomodoro.

## Goals logic

- Stored fields include `targetHours` and `deadline`.
- Calculations use actual tracked time and today tracked time.
- Required hours/day = remaining hours / remaining calendar days.
- The UI stays compact and shows the goal, deadline, remaining time and required pace.
- Graph, forecast and ahead/behind are removed from the current scope.

## Backup and sync logic

- Workspace data is exported/imported as versioned local JSON.
- Backup metadata includes `workspaceId`, `deviceId` and `schemaVersion`.
- Tombstones preserve deletion information for later conflict-aware sync.
- Google Drive remains blocked until an OAuth Client ID is configured.

## Plugin and theme future ideas

- WordPress-like actions, filters and hooks.
- Blocks, widgets, views and app views.
- Themes, templates and template parts.
- Permissions and sandboxing.
- A future plugin SDK after the core is stable.
- Themes/plugins for the future official catalogue must be GPL-compatible.
- Noma Mobile, Sync and the catalogue are separate official products.
- The Noma name/logo have no registered trademark claim in this repository.

## Future ideas

- Companion plugin.
- Noma Teacher.
- Typing Trainer.
- Skills apps.
- Mobile app.
- Real Google Drive sync.
- Windows EXE packaging.

## Current Git status

- Branch: `feature/desktop-launcher`.
- Verified launcher/test checkpoint: `1d7f819` (2026-09-07).
- Package version: `0.9.0-local.0`.
- Release tag: `v0.8.0-local` on `f6b5e9f`.
- Release checkpoint exists.
- Remote `origin`: https://github.com/AlbertDirksen15/Noma.git.
- No push was performed during this MVP 0.9 task; earlier remote push state was not independently verified.

## What not to do now

- Do not start full automatic sync without a tombstone and conflict-resolution strategy.
- Do not fake Google Drive.
- Do not start the plugin SDK before the core is stable.
- Do not overload the UI with a dashboard.

## Next recommended steps

- Manually test `npm run desktop` on Windows.
- Run `npm run build:portable` and test `release/Noma-portable/Noma.cmd` on Windows.
- Push only after separate user authorization. Do not create a new tag or release without authorization.
- Later package Noma as `Noma.exe`.

## MVP 0.9 portable verification — 0.9.0-local.0

Build: `npm run build:portable`. Copy the complete generated `release/Noma-portable` folder: Noma.cmd, Noma.ps1, README_RUN.txt, dist/, server/. Generated artifacts are ignored by Git. Node.js 22.12+ or 24 LTS must be installed in PATH; no npm install is needed on the destination machine. This prepares EXE packaging but does not include a runtime or signed executable.

Launch Noma.cmd. Noma.ps1 is optional and subject to PowerShell execution policy. Repository launchers also work after npm run build. Browser opening is automatic; the server binds only to 127.0.0.1:3847. Occupied ports fall back to the next port; at 65535 Windows chooses a free port. NOMA_PORT overrides the initial port; invalid values are rejected.

Keep the terminal open. Ctrl+C gracefully stops the listener and allows active requests up to three seconds. Closing the browser does not stop the server. Missing dist/index.html reports a build instruction. Encoded traversal and symlinked files outside dist are rejected.

Data is stored in browser IndexedDB, not in the portable folder. Browser profile and port are part of the storage origin: a fallback port can appear empty. Return to the original port/profile or use Workspace Export/Import. Export before moving computers. Stop Noma before rebuilding. If Windows prevents cleanup, the builder may reuse the folder; inspect it before distributing.

Checks: npm run lint, npm run typecheck, npm test, npm run build, npm run build:portable. Tests cover port fallback/config, localhost binding, index/assets/SPA, traversal, missing output, graceful shutdown, copying real templates and stale asset removal. No push, tag or remote release is part of this checkpoint.

Final verification on 2026-09-07: lint, typecheck, 76 tests across 12 files, build and build:portable passed using npm.cmd (the local npm.ps1 wrapper resolved a broken global npm path). Packaged templates and production assets match their sources byte-for-byte; packaged server HTTP index/SPA smoke and shutdown passed on Windows, bound to 127.0.0.1. Windows cleanup reused the output directory; inspection found only the expected seven files. Double-click launch and ordinary-browser interaction remain manually unverified. Existing uncommitted src/App.tsx and src/styles.css changes were preserved and are included in the working-tree build, but excluded from launcher commits.
