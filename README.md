# Noma

Local-first notes, projects, planning and time tracking app.

Current release name: **Noma 0.9 Beta** (`0.9.0-local.0`).

## License and extensions

Noma Core is licensed under [GPL-3.0-or-later](LICENSE). Noma is designed to
be extended without modifying Core: themes will control appearance and plugins
will add optional functionality through a documented API. The planned extension
model and publishing rules are in [PLUGINS_AND_THEMES.md](PLUGINS_AND_THEMES.md).

Official Noma Mobile, Noma Sync and a future reviewed extension catalogue are
separate products. The Noma name and logo are not registered trademarks in
this repository.

## MVP 0.1

React + TypeScript + Vite prototype with a Keep-inspired notes screen and local persistence through IndexedDB/Dexie. The application runs locally in a browser or through the lightweight local desktop launcher.

## Run

```bash
npm install
npm run dev
```

## Desktop local mode

Build and serve the production frontend through a localhost-only Node server:

```bash
npm run desktop
```

The launcher serves the built app on `127.0.0.1:3847`, selects the next free port when needed, and opens the normal browser. Use `npm run desktop:serve` to serve without opening a browser. This is still a local web app: there is no cloud backend, remote API or native Windows EXE packaging yet.

## Windows portable folder

Create a portable folder with the production build and Windows launchers:

```bash
npm run build:portable
```

The generated `release/Noma-portable/` contains `Noma.cmd`, `Noma.ps1`, `README_RUN.txt`, the static `dist/` build and the local server script. The generated folder is ignored by Git. Node.js must be installed; a future `Noma.exe` may bundle the runtime.

## MVP 0.9 portable verification — 0.9.0-local.0

Build: `npm run build:portable`. Copy the complete generated `release/Noma-portable` folder: Noma.cmd, Noma.ps1, README_RUN.txt, dist/, server/. Generated artifacts are ignored by Git. Node.js 22.12+ or 24 LTS must be installed in PATH; no npm install is needed on the destination machine. This prepares EXE packaging but does not include a runtime or signed executable.

Launch Noma.cmd. Noma.ps1 is optional and subject to PowerShell execution policy. Repository launchers also work after npm run build. Browser opening is automatic; the server binds only to 127.0.0.1:3847. Occupied ports fall back to the next port; at 65535 Windows chooses a free port. NOMA_PORT overrides the initial port; invalid values are rejected.

Keep the terminal open. Ctrl+C gracefully stops the listener and allows active requests up to three seconds. Closing the browser does not stop the server. Missing dist/index.html reports a build instruction. Encoded traversal and symlinked files outside dist are rejected.

Data is stored in browser IndexedDB, not in the portable folder. Browser profile and port are part of the storage origin: a fallback port can appear empty. Return to the original port/profile or use Workspace Export/Import. Export before moving computers. Stop Noma before rebuilding. If Windows prevents cleanup, the builder may reuse the folder; inspect it before distributing.

Checks: npm run lint, npm run typecheck, npm test, npm run build, npm run build:portable. Tests cover port fallback/config, localhost binding, index/assets/SPA, traversal, missing output, graceful shutdown, copying real templates and stale asset removal. No push, tag or remote release is part of this checkpoint.
