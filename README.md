# Noma

Local-first notes, projects, planning and time tracking app.

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
