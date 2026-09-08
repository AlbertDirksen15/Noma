# Noma Release Notes

## Noma 1.0 Beta — v1.0.0-beta.0

Noma 1.0 Beta is a local-first Windows portable application. The official portable folder is `release/Noma-portable`; do not use `outputs/Noma-portable` or create another fallback copy.

- `Noma.exe` includes the Node runtime in `runtime/node.exe`; a separate Node.js installation is not required.
- The launcher starts without a visible console window and places Noma in the Windows system tray.
- Tray actions are `Open Noma` and `Exit Noma`.
- A second launch reuses the existing localhost instance and does not create another server or port.
- `Exit Noma` sends an authenticated shutdown request to the localhost server and stops only the child process owned by that launcher.
- The server binds only to `127.0.0.1`, uses port `3847` by default and falls back only for a real port conflict.
- If the official portable folder is locked, stop the running Noma instance before rebuilding. Do not create a second output path.
- Notes, projects, nested content, timers, goals, Pomodoro, history, backup, drawing, photos and password protection are included.
- The executable is unsigned and no Windows installer is included.

## Verification status

The source launcher and server checks are maintained in the repository. The final portable folder is refreshed only after the agreed verification block and is kept at `release/Noma-portable`.

## Historical: Noma 0.9 Beta — v0.9.0-local.0

This was the pre-1.0 Node-required portable stage. It introduced `Noma.cmd`, `Noma.ps1`, the localhost server and the first `release/Noma-portable` layout. Its Node.js requirement and pre-EXE packaging statements are historical and do not apply to Noma 1.0 Beta.

## Historical: v0.8.0-local

This checkpoint introduced local workspace Backup/Restore, revisions, time tracking, goals, Pomodoro, projects and nested notes. Google Drive remained unavailable until real OAuth configuration is supplied.
