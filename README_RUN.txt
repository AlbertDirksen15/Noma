Noma portable local launcher
============================

Requirements
------------

- Windows.
- Node.js installed and available as `node` in PATH.

Run
---

Double-click `Noma.cmd`, or run it from PowerShell. It starts the existing production frontend through a Node server bound only to `127.0.0.1`, defaults to port 3847, selects the next free port when needed, and opens the normal browser.

To build or refresh the portable folder from the repository:

    npm run build:portable

The launcher is a local browser application using IndexedDB. It has no cloud backend and does not send user data anywhere. Google Drive backup is blocked until a real OAuth Client ID is configured.

This MVP prepares a portable launcher; it is not a bundled or signed `Noma.exe`. A future package may bundle the Node.js runtime.
