# Noma — AI development instructions

Before substantial work, read:

- `README.md`
- `docs/project-memory/NOMA_PROJECT_MEMORY.md`
- `ROADMAP.md` only when the task concerns planned or future functionality
- `NOMA_SPEC.md` when architectural or historical context is needed

Current code and Git state take priority if documentation conflicts with the repository.

## Project rules

- Development branch: `feature/desktop-launcher`.
- Noma is local-first and offline-first.
- Do not introduce a mandatory cloud backend unless explicitly requested.
- Preserve the universal `Note` model and existing IndexedDB/Dexie persistence unless the task explicitly requires changing them.
- Reuse existing components and services instead of creating duplicate implementations.
- Do not add speculative features.
- Do not remove, simplify or redesign existing functionality unless explicitly requested.
- For UI/design tasks, preserve existing behavior unless the request explicitly changes behavior.
- User-provided screenshots are the visual source of truth for UI tasks.
- Do not reinterpret the design or add extra UI elements that were not requested.
- `NOMA_MASTER_CONTEXT_PROMPT.txt` is historical only and must not be treated as the current source of truth.

## Scope discipline

Implement only what the user requested.

Do not:

- add unrelated refactors;
- redesign unrelated screens;
- create new architecture without necessity;
- change timer, goals, autosave, history, drawing, photos, password protection, backup, tree behavior or persistence unless the task specifically concerns them;
- add new features just because they seem useful.

## UI CHANGE SAFETY — PRESERVE EXISTING INTERFACE

For UI tasks, changes must be additive and minimal by default.

When the user asks to add, move, restyle, or change one UI element:

- Preserve all existing UI elements unless the user explicitly asks to remove them.
- Do not remove controls, labels, metrics, buttons, indicators, menus, panels, breadcrumbs, cards, actions, or status information as a side effect.
- Do not replace an existing layout with a simplified version unless explicitly requested.
- Do not hide existing information to make room for a new element unless the user explicitly approves that tradeoff.
- Do not infer that an element is unnecessary just because it looks redundant.
- Do not change unrelated parts of the screen.

Before editing a screen:

1. Identify the exact requested element(s).
2. Identify the existing surrounding UI that must remain unchanged.
3. Make the smallest possible change.

For requests like “add a button”, “move this”, “make this smaller”, “change this color”, or “open this as modal”, assume everything else on that screen must remain as-is unless explicitly stated otherwise.

If an existing element must be removed, hidden, or structurally changed to implement the request, stop and ask the user first.

## NO SILENT REMOVALS

Never silently remove existing functionality or visible UI.

If a requested change appears to conflict with an existing element:

- preserve both if possible;
- otherwise explain the conflict before changing anything.

## BEFORE / AFTER CHECK

For UI changes, compare the screen before and after. The final result must preserve all previously existing unrelated elements.

If screenshots are provided, treat the existing screenshot as the baseline and the user's requested change as a delta; do not recreate the whole screen from memory.

## COMPONENT REUSE

When the same UI or behavior appears in multiple places, use a shared component rather than maintaining separate copies.

For example, note metrics should use one shared compact summary component, the note modal should use one shared editor component, and the same note controls should not be independently recreated in different screens. This reduces the chance that adding something in one place makes something else disappear elsewhere.

UI tasks are patch operations, not redesign operations, unless the user explicitly says “redesign”.

Time statistics are protected UI. No unrelated task may modify Всего, Сделано сегодня, or Нужно в день without explicit user permission.

When changing an existing screen, first inspect the current component and preserve its existing child elements. Do not rewrite the component from scratch for a small UI request. For small UI requests, prefer a surgical patch over full component replacement.

## PROTECTED TIME STATISTICS — DO NOT CHANGE WITHOUT EXPLICIT USER APPROVAL

The time statistics UI is protected and must not be changed, removed, hidden, renamed, reordered, simplified, or replaced unless the user explicitly asks to change the statistics themselves.

Protected statistics:

- `Всего`
- `Сделано сегодня`
- `Нужно в день`
- `Осталось`

These four metrics are considered part of the stable Noma UI contract.

Rules:

- Do not remove any of these metrics as a side effect of another UI change.
- Do not hide them to make room for another control.
- Do not replace them with icons only.
- Do not rename them.
- Do not merge them into another label.
- Do not move them to another screen unless the user explicitly asks.
- Do not change their calculation logic.
- Do not create a second calculation implementation.
- Reuse the existing Noma time-summary / goal-calculation logic.
- Do not change when `Нужно в день` is displayed without explicit user approval.
- Do not infer that `Нужно в день` is unnecessary because a goal panel is collapsed.
- Do not simplify the compact summary.

For ordinary note and project UI work, assume these statistics must remain visible exactly as existing protected information.

If a requested UI change conflicts with the current placement of these statistics:

1. preserve the statistics first;
2. make the requested change around them if possible;
3. if preserving both is not possible, STOP and ask the user before changing the statistics.

This rule overrides ordinary layout cleanup and visual simplification.

## LABEL AND UI TEXT SAFETY

Use the simplest existing labels possible.

For projects:

- use `Проект`
- do NOT use `Проект · папка`
- do NOT add explanatory suffixes like:
  - `· папка`
  - `· запись`
  - `· самостоятельная запись`
  - or any similar descriptive additions

For notes:

- do not add extra descriptive labels unless the user explicitly asks.

## NO EXTRA TEXT WITHOUT EXPLICIT REQUEST

Do not add any extra UI text, helper text, descriptive text, explainer text, badges, captions, subtitles, or labels unless the user explicitly asks for them.

This includes:

- extra words next to titles
- extra object-type descriptions
- helper captions under titles
- explanatory phrases added “for clarity”
- generated placeholder explanations
- extra tags or metadata labels not explicitly requested

If the current UI already works without that text, preserve the simpler version.

Default rule:

- do not append anything;
- do not decorate labels;
- do not expand labels;
- do not add descriptive wording on your own.

UI changes must stay minimal.
If the user asks to add one thing, do not add extra text around it.

Do not add text that was not explicitly requested by the user.

If unsure whether a label or extra text is needed, do not add it.

## PLUGIN SLOTS — PUBLIC UI EXTENSION POINTS

Plugin slots are part of the public Noma UI architecture. Do not remove, rename or change their semantics during an unrelated UI refactor.

The first slot is `timer.right.collapsed`, located in the unused right-side area of the timer module when goal input fields are collapsed. Empty slots must render no visible UI.

## NOTE, PROJECT AND GOAL LAYOUT

PROJECT and SUBPROJECT are full-page workspaces/boards. NOTE is the shared modal overlay from All Notes, projects and subprojects. A project remains visible behind its note modal, and closing the modal returns to that project. A direct full-page note route is only a fallback/deep-link.

The note modal has a blue canvas. Its white top module contains only statistics, timer, Pomodoro, time controls and the goal editor. The title, body and existing note actions stay on the blue canvas below. The goal editor is on the right; expanding it must not move or resize the timer, title, body or lower controls. It has no internal scrollbar, extra horizontal border or heavy separate pane border. Keep autosave but do not show `Сохраняется автоматически`.

## Noma Chat Assistant Handoff Reminder

Whenever the user starts a new conversation, task, or work session related to Noma, first check whether `docs/project-memory/NOMA_ASSISTANT_HANDOFF_PROMPT.md` exists.

If it exists and the user has not already confirmed that it was sent to the current chat assistant session, remind the user: “Перед тем как продолжать работу над Noma, отправь docs/project-memory/NOMA_ASSISTANT_HANDOFF_PROMPT.md в чат-помощник, чтобы он восстановил актуальный контекст проекта.”

Do not assume a fresh chat assistant remembers an old Noma conversation. Once the user confirms the handoff prompt was sent to the current assistant session, do not repeat the reminder again in the same work session. Do not delete or weaken this reminder during unrelated cleanup or refactoring.

## TEST POLICY — IMPORTANT

Do not create new tests by default.

For normal feature work, UI work, layout changes, CSS changes, component extraction and refactoring that does not change business logic:

- do not add new tests;
- do not add smoke tests;
- do not add test fixtures;
- do not add test data;
- do not add browser automation;
- do not add testing infrastructure;
- do not expand the existing test suite;
- do not spend time creating additional coverage.

Existing tests must remain intact. Do not modify existing tests merely to make an unintended behavior change pass.

Add the smallest relevant regression test only when the user explicitly asks for tests or when an important business-logic change genuinely requires regression coverage. If unsure whether a new test is needed, do not create one; ask the user first.

For ordinary UI work, validation is limited to:

- `npm run typecheck`
- `npm run build`

Do not run `npm test` unless:

1. the user explicitly asks to run tests;
2. the task changes important business logic; or
3. a regression test is genuinely necessary for the requested behavior.

Never create tests merely because code was changed. Do not create smoke fixtures or test data for ordinary UI work.

Portable/release tests and `npm run build:portable` may run only when the user explicitly requests work on the portable/release build.

## Git and release rules

- Work in `feature/desktop-launcher`; do not switch to `main` or create a replacement copy of the repository.
- Do not push without an explicit user request or a deliberate remote checkpoint request.
- Do not create tags or releases without an explicit user request.
- Do not rebuild portable artifacts unless explicitly requested.
- Do not create fallback release directories.
- The only official portable path is `release/Noma-portable`.
- Never commit `release/`, `dist/`, `node_modules/`, `.npm-cache/`, temporary files or logs.

## Completion

Before finishing:

- summarize changed production files;
- list validation performed;
- mention anything intentionally left unchanged;
- do not continue into extra cleanup or testing unless requested.
