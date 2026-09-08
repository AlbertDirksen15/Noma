# Noma

Noma is a local-first notes, projects, planning and time-tracking application. User data stays in the browser's local IndexedDB storage; there is no mandatory cloud backend.

## Source of truth

`NOMA_PROJECT_MEMORY.md` is the source of truth for implemented behavior; `ROADMAP.md` is the source of truth for planned work. Current code and Git state take priority if documentation conflicts with the repository. `NOMA_MASTER_CONTEXT_PROMPT.txt` is historical only and is not an active instruction.

## License and extension boundary

Noma Core is licensed under [GPL-3.0-or-later](LICENSE). Core owns data and application behavior. Themes own presentation, and future plugins will use documented contracts without modifying Core. The design boundary is described in [docs/EXTENSIBILITY.md](docs/EXTENSIBILITY.md); no plugin runtime or public SDK is shipped yet.

## Development

```bash
npm install
npm run dev
```

The Vite development server runs the source tree. Keep development work in the repository branch `feature/desktop-launcher`.

## Desktop local mode

```bash
npm run desktop
```

This builds the frontend and serves it through the localhost-only Node server on `127.0.0.1`, starting at port `3847` and falling back only when that port is genuinely occupied. `npm run desktop:serve` starts the server without opening a browser. This mode remains a local browser application.

## Windows portable mode

The one official portable folder is:

`release/Noma-portable`

It contains `Noma.exe`, bundled `runtime/node.exe`, the localhost server, `dist/`, `Noma.cmd`, `Noma.ps1` and `README_RUN.txt`. A separate Node.js installation is not required. The current launcher uses a system-tray icon with `Open Noma` and `Exit Noma`, reuses a running instance, writes a private runtime-state file and shuts down its own server through an authenticated localhost request.

Build or refresh this folder only with:

```bash
npm run build:portable
```

Never create `outputs/Noma-portable` or another fallback copy. If `release/Noma-portable` is locked, stop the running Noma instance first and retry; do not write to a second output path. Portable output is ignored by Git and should not be committed.

The application binds only to `127.0.0.1`. The launcher does not terminate unrelated user processes; it only controls the Node child process it started.

## Implemented capabilities

- Notes, search, autosave, recovery drafts, pinning and manual ordering.
- Today, Inbox, Archive, Trash and subtree restore/delete behavior.
- Projects, subprojects, notes inside notes, boards and separate project descriptions.
- Mixed breadcrumbs, move actions and cycle protection.
- Persistent timers, manual entries, Pomodoro and workspace summaries.
- Goals with optional dates, dynamic `Required per day` and tree-wide aggregation.
- Project deadline limits, conflict warnings and daily values above 24 hours.
- Version history, JSON Backup/Restore and tombstone metadata.
- Inline drawing, photo previews/trash and password protection.
- Theme tokens and modular service boundaries prepared for future extensions.

## Distribution status

The portable executable is unsigned and has no installer. Google Drive OAuth, automatic two-way sync, mobile applications and the extension catalogue remain future work.
