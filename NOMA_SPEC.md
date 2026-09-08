# Noma — Master Specification

Noma is a local-first application for notes, projects, planning and time tracking. The source requirements are maintained in the project history and expanded incrementally. MVP 0.1 focuses on the first mandatory scenario: launch locally, create and edit a note, close, reopen, and retain the note locally.

## Principles

- Local-first and offline-first.
- User owns the data; no mandatory Noma backend.
- Universal Note model with progressive complexity.
- Simple default UI; advanced capabilities remain optional.
- Architecture should leave room for sync, mobile, plugins, themes and Steam packaging.

## Open Core and extensions

Noma Core is GPL-3.0-or-later. The project follows a WordPress-style model:
Core stays independently updateable while themes and plugins extend it through
a documented API instead of changing Core files. Themes will begin as
declarative design-token packages. Plugins will declare their identity,
compatibility and permissions, and use controlled actions, filters, UI slots
and workspace APIs. The first plugin SDK is a post-launch milestone.

Noma Mobile, Noma Sync and a future reviewed extension catalogue are separate
official products. This repository does not claim a registered trademark for
the Noma name or logo.

## Roadmap

0.1 notes and persistence; 0.2 today/inbox/archive/trash; 0.3 nested notes/projects (completed); 0.4 time tracking; 0.5 goals/deadlines and dynamic pace; 0.6 Pomodoro; 0.7 note version history and restore; 0.8 local workspace backup with a blocked Google Drive prototype; 0.9 Windows portable launcher preparation; 1.0 Windows portable `Noma.exe` packaging.

MVP 0.8 starts with a versioned local workspace JSON and visible Backup/Restore flow. The planned Drive location is the user-readable `Google Drive / Noma/` folder; private `appDataFolder` is intentionally excluded. Drive upload requires configured OAuth credentials.

## Later platforms

Android, iOS and Steam are post-desktop milestones. The core remains a local web UI served by a local process; platform-specific launchers or embedded views may be added later without changing the data model.

## Desktop local mode

The current desktop shell is intentionally minimal: `npm run desktop` builds the existing Vite frontend, serves `dist` from a Node HTTP server bound only to `127.0.0.1`, selects the next available port after `3847`, and opens the normal browser. It has no cloud backend, remote API or native UI. Windows EXE/installer packaging remains a later step.

Noma 1.0 Beta adds a native `Noma.exe` launcher and bundles `runtime/node.exe` into the ignored `release/Noma-portable/` folder. It keeps serving the static UI only on localhost and requires no separately installed Node.js runtime. It remains unsigned and has no installer.

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


## 2026-09-08 — Photos and photo trash

Notes and projects accept multiple local image files through the compact photo button. Supported formats are JPEG, PNG, WebP, GIF, AVIF and BMP. Photos appear as previews; clicking a preview opens the full image. Each preview has a trash icon in its upper-right corner. Removing a photo is recoverable: the photo is marked deleted and appears in the application's Trash view. Restore brings back the original photo; Clear photo trash permanently removes trashed photo data and its revision copies after confirmation.

Photos are stored as data URLs with name, MIME type, dimensions and timestamps. Note updates, autosave, revisions and workspace JSON carry photo metadata. Protected notes encrypt photos with the same AES-GCM envelope as title, content and drawings. Photo trash does not delete the parent note or tracking history. Old notes without photos remain compatible.

Validation: 105/105 tests pass, including photo trash restore/purge, encrypted photos and backup round trip. Browser checks covered the Add photo control and photo preview rendering.
