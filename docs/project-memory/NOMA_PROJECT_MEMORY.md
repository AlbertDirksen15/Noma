# Noma Project Memory

## What is Noma

Noma is a local-first personal productivity app built around universal notes. It combines notes, projects, nested notes, time tracking, goals, workspace backup/restore, and a lightweight desktop local mode.

## Core philosophy

- Capture now, organize later.
- The user owns the data.
- No required cloud backend.
- Google Keep-like simplicity.
- Keep the core extensible for later plugins, themes, sync and platform shells.

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
- MVP 0.9 Windows portable launcher preparation: COMPLETE for the local launcher scope; native EXE remains future work.

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
- Latest committed launcher/docs checkpoint: `5024f3e`.
- Package version: `0.9.0-local.0`.
- Release tag: `v0.8.0-local` on `f6b5e9f`.
- Release checkpoint exists.
- Remote `origin` is not configured.
- No push has been performed.

## What not to do now

- Do not start full automatic sync without a tombstone and conflict-resolution strategy.
- Do not fake Google Drive.
- Do not start the plugin SDK before the core is stable.
- Do not overload the UI with a dashboard.

## Next recommended steps

- Manually test `npm run desktop` on Windows.
- Run `npm run build:portable` and test `release/Noma-portable/Noma.cmd` on Windows.
- Add a GitHub `origin` remote.
- Push `develop` and the release tag after authentication is available.
- Optionally configure a Google OAuth Client ID.
- Later package Noma as `Noma.exe`.
