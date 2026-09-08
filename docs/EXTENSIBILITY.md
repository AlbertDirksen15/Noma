# Noma core, plugins and themes

The architecture follows the separation used by WordPress: core owns data and application behavior; themes own presentation; future plugins add capabilities through explicit extension contracts. No plugin runtime or public SDK is shipped yet.

## Current boundaries
- UI components invoke noteEditing, noteUpdateService, trackingRepository and goalRepository. Partial updates prevent an editor from replacing goal/tracking fields it does not own.
- Core navigation metadata lives in src/core/navigation.ts, independently from icon rendering.
- src/themes/default.css defines semantic CSS tokens for surfaces, text, accent, note colors and timer states. Themes can override these tokens without changing persistence.
- New optional pinned and sortOrder fields preserve compatibility with existing local notes.

## Future contracts
Introduce versioned actions (notifications after committed operations), filters (validated transformations), command registration, navigation/view slots, templates and blocks. Keep storage and migrations under core control; extensions must not write directly to Dexie tables. Theme packages must not implement persistence or timer logic. Define permissions, sandbox boundaries and lifecycle activation/deactivation before loading third-party code. Deactivation must preserve user content and extension metadata. Additive namespaced metadata needs an explicit backup/import contract before plugins use it.

This document is a design boundary, not a promise of an available WordPress-compatible API.


Drawing is the first self-contained content feature: src/drawing/model.ts contains the versioned vector data and pure geometry, DrawingEditor.tsx the UI, and drawing.css the themed controls. Persistence uses the existing note service rather than a separate drawing database; backup and revision contracts include drawing data. This is a core feature today, with module boundaries suitable for a future content-block API.


Note protection is owned by src/protection/noteProtection.ts. All editable note content must pass through the canonical update service so future extensions cannot accidentally persist decrypted title/text/drawing. The cryptographic envelope has version 1; UI-only unlocked flags and in-memory keys are not persistent credentials. Future sensitive content blocks must extend the encrypted payload contract, revision migration and backup tests before shipping.
