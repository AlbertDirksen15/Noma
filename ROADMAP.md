# Noma Roadmap

`NOMA_PROJECT_MEMORY.md` is the source of truth for implemented behavior; `ROADMAP.md` is the source of truth for planned work. Current code and Git state take priority if documentation conflicts with the repository.

`NOMA_MASTER_CONTEXT_PROMPT.txt` is a retained historical document. It describes an older Noma state and is not an active instruction.

## 1. CURRENT STATE

- Development branch: `feature/desktop-launcher`.
- Latest implementation checkpoint: `c956aa7` (`feat: complete Windows desktop launcher`).
- Remote: `origin` is `https://github.com/AlbertDirksen15/Noma.git`.
- The implementation checkpoint is local on `feature/desktop-launcher`; it has not been pushed to `origin`.
- Product version: Noma 1.0 Beta, `1.0.0-beta.0` in `package.json`.
- `package-lock.json` and workspace backup exports now use the package version through the shared application-version module.
- The repository contains 134 test scenarios. Launcher/version checks have passed; final end-to-end smoke verification remains.
- The basic `Noma.exe` and bundled `runtime/node.exe` already exist. The destination computer does not require a separate Node.js installation.
- The tray-based Windows launcher is implemented; final smoke verification and portable refresh remain.
- Development continues from source and the dev version. Portable output is created only after the explicit command “собери релиз”.
- The single official portable output is `release/Noma-portable` inside the Noma source repository. `outputs/Noma-portable` was a temporary fallback created when the official portable folder was locked and is not a second release location. If the official folder is locked, stop the running Noma instance before continuing; do not create another output path.

## 2. COMPLETED

### MVP 0.1–0.2 — Notes and planning

- Local-first notes stored in IndexedDB.
- Create, edit, autosave, search, pin and drag ordering.
- Today, Inbox, Archive and Trash with restore.
- Default current-tasks and recurring-tasks notes in Today.
- Soft, minimal sidebar and persistent application header.

### MVP 0.3 — Projects and nested content

- Projects and subprojects based on the universal Note record.
- Notes nested inside projects or other notes.
- Mixed note/project breadcrumbs and safe move operations.
- Cycle prevention and subtree archive, trash, restore and deletion.
- All Projects inside the normal workspace shell.
- Folder-style project cards with filled colored tabs.
- Separate project board and project-description page.
- Project boards contain nested notes and subprojects rather than a normal note editor.

### MVP 0.4 — Time tracking

- Persistent Start, Pause, Resume and Stop sessions.
- One active timer across the workspace.
- Manual time entries and comments.
- Per-note, per-project and workspace totals.
- Today counters and non-destructive Reset Total behavior.
- Collapsible timer drawer that pauses active work when closed.
- Compact running/paused status indicator.

### MVP 0.5 — Goals and daily planning

- Note targets in hours with an optional date.
- Goal drafts preserve incomplete hours and date text.
- Automatic persistence plus an explicit Save Goal action.
- Dynamic remaining time and Required per day calculation.
- Daily values may exceed 24 hours and small values display in minutes.
- Project deadline without a direct project-hours input.
- Project time targets aggregate all descendant note goals.
- Project Total, Today and Required per day counters.
- Workspace Required per day counter.
- Parent project deadlines limit descendant planning and counted time.
- Red Requires attention indicator when a child deadline exceeds its project deadline.

### MVP 0.6 — Pomodoro

- Configurable work interval and SVG progress ring.
- Running and completed visual states.
- Main time tracking continues independently from Pomodoro completion.
- Separate Reset Pomodoro and Reset Timer controls.

### MVP 0.7 — Version history

- Persistent revision snapshots for significant changes.
- Revision preview, full restore and title/content-only restore.
- Coalescing and retention rules.
- Revision cleanup during permanent subtree deletion.

### MVP 0.8 — Local backup and recovery

- Versioned JSON workspace export/import.
- Notes, tracking sessions, revisions and tombstones included.
- Workspace/device identity metadata.
- Local Backup/Restore UI.
- Photo trash recovery and permanent purge.
- Google Drive storage direction selected, with implementation deferred until real OAuth is available.

### September 8 content and UX expansion

- Immediate note autosave and recovery journal.
- Pin-first card order and persistent manual sorting.
- Simplified creation controls, breadcrumbs, project toolbars and nested actions.
- Inline drawing with pencil, pen, marker, eraser, color, width and undo/redo.
- Compact photo previews, full-image viewer and recoverable photo deletion.
- Password protection for note title, text, drawing and photos.
- Project/note labels and separate project-description workflow.
- Nested notes inside notes and complete mixed-tree navigation.
- Tree-wide time aggregation, daily planning and deadline conflict handling.
- Collapsed goal/time summaries and minute formatting for small daily values.
- `Made by Albert D.` application credit.
- Theme tokens and core module boundaries prepared for future extensions.

### MVP 0.9–1.0 — Portable application foundation

- Localhost-only static server with port fallback and optional browser opening.
- SPA fallback, asset serving, traversal protection and graceful shutdown.
- Portable builder that creates `Noma.exe`, `runtime/node.exe`, server files and `dist/`.
- External Node.js is no longer required for the complete portable folder.
- Authenticated local shutdown endpoint and runtime-state-file support have been added to the server.
- Generated `release/`, `dist/`, `node_modules/`, `.npm-cache/` and logs are excluded from Git.

## 3. IN PROGRESS

### Verify and refresh the desktop launcher

The launcher implementation is complete in source. Finish verification and refresh the one official portable folder:

1. Run the final full check once after documentation changes.
2. Perform safe manual smoke checks for first launch, tray actions, repeat launch and Exit.
3. Refresh only `release/Noma-portable` after confirming no old Noma process is locking it.

### Resolve current consistency gaps

- Package and backup version metadata use `1.0.0-beta.0` from the package manifest.
- Current portable instructions are separated from historical Node-required notes in the documentation.
- The 134 existing test scenarios have targeted coverage; the final full run is performed once at the end of this block.

## 4. NEXT

After desktop launcher verification is complete:

1. Run the final full check once and complete focused launcher/server smoke verification.
2. Refresh only `release/Noma-portable` and confirm `Noma.exe`, `runtime/node.exe`, `server`, `dist` and launcher files.
3. Create a logical commit in feature/desktop-launcher. Push only when the user explicitly requests it or when creating a deliberate remote checkpoint.
4. Start MVP 1.1 by specifying plugin manifests, versioned hooks, permissions, lifecycle, UI slots and backup metadata before implementing plugin loading.

## 5. FUTURE ROADMAP

### MVP 1.1 — Themes & Plugin Foundation

- Declarative plugin and theme manifests.
- Version and compatibility checks.
- Versioned actions, filters and commands.
- Blocks, views, navigation entries and controlled UI slots.
- Namespaced extension metadata with backup/import support.
- Permissions, sandbox boundaries and safe failure isolation.
- Activation, deactivation and uninstall lifecycle that preserves user content.
- Extension-management interface.

### Sync and cloud

- Real Google Drive OAuth.
- Visible `Google Drive / Noma/` storage.
- Tombstone-aware conflict resolution.
- Explicit backup and recovery controls before automatic two-way sync.
- Cross-device synchronization only after conflict behavior is defined and tested.

### Distribution

- Signed Windows executable.
- Windows installer and update strategy.
- Portable release verification on a clean Windows computer.
- Clear migration and recovery documentation.

### Platforms and extensions

- Noma Mobile.
- Official extension catalogue.
- Companion extension.
- Noma Teacher.
- Typing Trainer.
- Skills apps and future content blocks.
