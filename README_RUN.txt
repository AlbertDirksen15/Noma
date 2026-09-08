Noma portable Windows launcher
==============================

Official folder
---------------

The only official portable folder is:

    release\Noma-portable

Keep the complete folder together. It contains Noma.exe, runtime\node.exe,
server\desktop-server.mjs and dist\.

Run
---

Double-click Noma.exe. Noma runs locally on 127.0.0.1, starts at port 3847,
and opens the browser. The launcher stays in the Windows system tray.

Tray menu
---------

- Open Noma — opens the existing local Noma page.
- Exit Noma — requests an authenticated server shutdown and closes the launcher.

Launching Noma.exe again reuses the already-running instance. It does not start
a second server or select another port. The launcher controls only the Node
process it started and does not terminate unrelated user processes.

Portable policy
---------------

Do not create outputs\Noma-portable or any other fallback copy. If the official
folder is locked, stop the running Noma instance first and then rebuild the same
release\Noma-portable folder.

No separate Node.js installation is required. The executable is unsigned and
there is no Windows installer yet. Data is stored in browser IndexedDB, not in
this folder. Google Drive is unavailable until real OAuth configuration is
added.
