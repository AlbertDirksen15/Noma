Noma portable local launcher
============================

Requirements
------------

- Windows.
- No Node.js installation is required. Noma includes its own runtime.

Run
---

Double-click `Noma.exe`. It starts the existing production frontend through its bundled runtime on `127.0.0.1`, defaults to port 3847, selects the next free port when needed, and opens the normal browser. Keep the Noma window open; press Ctrl+C to stop it.

To build or refresh the portable folder from the repository:

    npm run build:portable

The launcher is a local browser application using IndexedDB. It has no cloud backend and does not send user data anywhere. Google Drive backup is blocked until a real OAuth Client ID is configured.

Noma 1.0 Beta is a portable Windows folder. It is not an installer or a signed executable yet, but it includes the runtime required to run Noma offline.

## MVP 0.9 portable verification — 0.9.0-local.0

Build: `npm run build:portable`. Copy the complete generated `release/Noma-portable` folder: Noma.cmd, Noma.ps1, README_RUN.txt, dist/, server/. Generated artifacts are ignored by Git. Node.js 22.12+ or 24 LTS must be installed in PATH; no npm install is needed on the destination machine. This prepares EXE packaging but does not include a runtime or signed executable.

Launch Noma.cmd. Noma.ps1 is optional and subject to PowerShell execution policy. Repository launchers also work after npm run build. Browser opening is automatic; the server binds only to 127.0.0.1:3847. Occupied ports fall back to the next port; at 65535 Windows chooses a free port. NOMA_PORT overrides the initial port; invalid values are rejected.

Keep the terminal open. Ctrl+C gracefully stops the listener and allows active requests up to three seconds. Closing the browser does not stop the server. Missing dist/index.html reports a build instruction. Encoded traversal and symlinked files outside dist are rejected.

Data is stored in browser IndexedDB, not in the portable folder. Browser profile and port are part of the storage origin: a fallback port can appear empty. Return to the original port/profile or use Workspace Export/Import. Export before moving computers. Stop Noma before rebuilding. If Windows prevents cleanup, the builder may reuse the folder; inspect it before distributing.

Checks: npm run lint, npm run typecheck, npm test, npm run build, npm run build:portable. Tests cover port fallback/config, localhost binding, index/assets/SPA, traversal, missing output, graceful shutdown, copying real templates and stale asset removal. No push, tag or remote release is part of this checkpoint.
