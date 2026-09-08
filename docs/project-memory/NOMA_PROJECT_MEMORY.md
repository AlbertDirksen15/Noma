# Noma Project Memory

This document is the source of truth for implemented Noma behavior and the current project state. `ROADMAP.md` is the source of truth for planned work. Current code and Git state take priority if either document conflicts with the repository.

`NOMA_MASTER_CONTEXT_PROMPT.txt` is retained as a historical record. It describes an earlier project state, is outdated and must not be used as the current source of truth.

## 1. CURRENT STATE

- Product: Noma, a local-first notes, projects, planning and time-tracking application.
- Development branch: `feature/desktop-launcher`.
- Current HEAD: `050f818` (`chore: update gitignore`).
- Remote: `origin` points to `https://github.com/AlbertDirksen15/Noma.git`.
- At the documentation checkpoint, local `feature/desktop-launcher` and `origin/feature/desktop-launcher` both point to `050f818` (`+0/-0`).
- These documentation edits are intentionally uncommitted until user review.
- Declared package version: `1.0.0-beta.0` in `package.json`.
- Known version mismatch: `package-lock.json` still says `0.9.0-local.0`.
- Known backup metadata mismatch: workspace exports still write `appVersion: 0.8.0`.
- Existing Git release tag: `v0.8.0-local`. There is no `1.0.0-beta.0` tag.
- The repository contains 134 test scenarios. They have not been run against the current HEAD during this documentation update, so this document does not claim that they currently pass.
- Development uses the source tree and dev version. Portable output is built only after an explicit user command to build a release.
- The only official portable output path is `release/Noma-portable` inside the Noma source repository. The separate `outputs/Noma-portable` folder was a temporary fallback created while the official portable folder was locked; it is not a second release location and should stop being used after the official folder is verified. If the official folder is locked, stop the running Noma instance before continuing; do not create another output path.

Noma stores user data locally in browser IndexedDB through Dexie. Notes and projects share the universal `Note` record; `isProject` selects project/container behavior. The hierarchy is stored through `parentId`, allowing notes and projects to contain notes and subprojects.

The current Windows portable design includes `Noma.exe`, `runtime/node.exe`, the local server and the production frontend. A separate Node.js installation is not required on the destination computer. The basic EXE exists, but it is still a console-style process launcher. The planned silent tray launcher is not complete.

The architecture is prepared for WordPress-inspired extension boundaries: core owns data and behavior, themes own presentation, and future plugins will use documented contracts. There is no plugin runtime or public plugin SDK yet.

## 2. COMPLETED

### Notes and workspace

- Local note creation, editing, search and persistence.
- Immediate autosave and a recovery journal for open, incomplete drafts.
- Close saves pending changes; `Ctrl+S` is also supported in full note view.
- Persistent pinning and drag ordering within pinned and unpinned groups.
- Pinned cards remain before unpinned cards, and new cards appear after pinned content.
- Sidebar views for All notes, All projects, Today, Inbox, Archive and Trash.
- Soft archive/trash lifecycle with restore and permanent subtree deletion support.
- Today initialization with the default current-tasks and recurring-tasks notes.
- Minimal sidebar selection, icons, top creation actions and persistent workspace chrome.
- Global workspace counters for total tracked time, today and required daily time.
- Application credit: `Made by Albert D.`.

### Projects, nesting and navigation

- Projects and notes use one compatible data model while presenting different interfaces.
- Projects are shown as folder-style cards with filled colored tabs and a larger color rotation.
- All Projects opens in the normal workspace area with the main header and sidebar preserved.
- A project opens as a board containing only nested notes and subprojects.
- Project title links to a separate project-description page with title and description but no timer.
- Notes can contain notes and subprojects.
- Breadcrumbs resolve mixed note/project parent chains.
- Notes and projects can be moved from their own views with cycle protection.
- Archive, trash, restore and permanent deletion operate on complete subtrees.
- Project and note child actions use compact text controls with separators.

### Time tracking, goals and Pomodoro

- Persistent Start, Pause, Resume and Stop sessions.
- One active timer across the workspace.
- Manual time entries with optional comments.
- Total and today counters for individual notes and complete descendant trees.
- Reset Total changes the displayed counter without deleting tracking history or goal progress.
- The timer drawer pauses a running session when collapsed.
- A small status circle shows an engaged running or paused session.
- A note without a goal shows no compact goal/time block while its timer is collapsed.
- A goal note shows Total, Today and Required per day while the timer is collapsed.
- A project always shows its compact aggregated time summary.
- Pomodoro has a progress ring, configurable duration and separate reset controls.
- Reset Timer is inside the Pomodoro options menu.
- Note goals accept hours with or without a deadline.
- Incomplete hours or date text is stored as a draft and survives closing.
- Complete goals autosave, and an explicit Save Goal action is available.
- Required per day is recalculated from remaining target time, tracked progress and remaining calendar days.
- Small daily values are shown in minutes; large values are not capped at 24 hours per day.
- A project accepts a deadline but no direct target-hours value.
- Project target, remaining time and required daily time are aggregated from descendant notes and projects.
- Descendant tracking is counted once across mixed trees.
- A descendant deadline later than its project deadline shows a red, focusable Requires attention indicator.
- Planning and counted session time are limited to the effective project deadline.

### Note content, media and protection

- Inline vector drawing inside the note view without opening another browser tab.
- Pencil, pen, translucent marker, stroke eraser, color, width, undo and redo controls.
- Drawing previews on notes, cards and history revisions.
- Local image insertion with compact previews and full-image viewing.
- Photo deletion uses the application Trash and supports restore or permanent purge.
- Any nonempty password can protect a note; there are no composition or length rules.
- Protected title, text, drawing and photos use AES-256-GCM with PBKDF2-derived keys.
- Passwords are not persisted, and closing a note forgets its unlocked session key.
- Protected data remains encrypted in revisions and workspace backups.

### History and backup

- Persistent snapshot history for significant note and project changes.
- Revision preview, full restore and title/content-only restore.
- History retention and coalescing for frequent edits.
- Versioned JSON workspace export/import for notes, sessions, revisions and tombstones.
- Workspace and device identity metadata.
- Local Backup/Restore interface.

### Desktop and extension preparation

- Localhost-only static server with default port `3847`, port fallback and browser opening.
- Static assets, SPA fallback, traversal protection and graceful server shutdown support.
- Authenticated local shutdown endpoint and runtime-state-file support in the server.
- Portable builder for `Noma.exe`, bundled `runtime/node.exe`, server files and `dist/`.
- `release/`, `dist/`, `node_modules/`, `.npm-cache/` and logs are excluded from Git.
- Default theme tokens live separately from application logic.
- Navigation metadata and project-card styling have dedicated core modules.
- Drawing, photos, protection, tracking, goals, tree operations and backup use separate service boundaries suitable for future extension contracts.

## 3. IN PROGRESS

### Desktop launcher completion

The basic `Noma.exe` exists and launches the bundled Node runtime. The complete Windows launcher experience is still in progress:

- connect the C# launcher to the server shutdown token and runtime-state file;
- start without a visible console window;
- add a system-tray icon with Open Noma and Exit actions;
- detect or reuse an already-running local Noma instance;
- stop the local server cleanly from the tray;
- replace console-only failures with understandable Windows dialogs;
- verify launcher behavior as one completed block before creating a new portable release.

### Consistency and verification

- `package-lock.json` must be updated from `0.9.0-local.0` to `1.0.0-beta.0` without changing dependencies unnecessarily.
- Workspace backup `appVersion` must stop reporting `0.8.0` and use the current application version from a single source.
- README, specification, changelog and release notes still contain historical Node-required and pre-EXE statements that need clearer historical labeling or removal from current instructions.
- The 134 existing test scenarios need one consolidated run after the desktop-launcher block; no passing status is claimed yet.
- Recent interface changes still need a focused manual check in the dev version.

## 4. NEXT

After the current desktop launcher is complete:

1. Run focused desktop-server and portable-builder checks, then one consolidated typecheck/test/build verification for the completed block.
2. Correct the version mismatch in `package-lock.json` and replace the hard-coded backup `appVersion` with the current application version.
3. Manually verify the dev-version flows for notes, projects, nested planning, deadline warnings, photos, drawing, passwords, archive/trash and backup restore.
4. Update `README.md`, `NOMA_SPEC.md`, `CHANGELOG.md` and `RELEASE_NOTES.md` so current instructions are separated from historical release notes.
5. Create a logical commit in feature/desktop-launcher. Push only when the user explicitly requests it or when creating a deliberate remote checkpoint. Do not build a portable release unless separately requested.
6. Define the MVP 1.1 Plugin Foundation contracts before implementing plugin loading: manifest schema, versioned actions and filters, UI slots, permissions, lifecycle and namespaced backup metadata.

## 5. FUTURE ROADMAP

- MVP 1.1 Themes & Plugin Foundation.
- Declarative plugin manifests and compatibility rules.
- Versioned actions, filters, commands, blocks, views and navigation slots.
- Plugin permission model, sandbox boundaries, activation/deactivation and safe failure handling.
- Extension-management UI and future official extension catalogue.
- Theme packages, templates and template parts.
- Real Google Drive OAuth and visible `Google Drive / Noma/` synchronization.
- Tombstone-aware conflict resolution before automatic two-way sync.
- Signed Windows executable and installer.
- Mobile application and cross-device synchronization.
- Future extensions such as Companion, Noma Teacher, Typing Trainer and Skills apps.
