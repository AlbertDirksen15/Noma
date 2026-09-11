# Noma — assistant handoff context

Work in the current local Noma repository on branch `feature/desktop-launcher`.

Noma is a local-first, offline-first application for notes, projects, planning and time tracking. User data is stored locally in IndexedDB through Dexie. Do not add a mandatory cloud backend. Notes and projects use the universal `Note` model; `isProject` selects container behavior and `parentId` stores the tree.

Current code and Git state are the highest source of truth. Then use `docs/project-memory/NOMA_PROJECT_MEMORY.md` for implemented behavior and `ROADMAP.md` for planned work. `NOMA_MASTER_CONTEXT_PROMPT.txt` is historical only.

UI model: PROJECT and SUBPROJECT are full-page workspaces/boards. NOTE opens in the shared modal overlay from All Notes, projects and subprojects. Opening a note from a project leaves the project behind the modal; closing it returns to that same project. A full-page note route may remain as a deep-link fallback, but is not the primary UX.

The blue note-modal canvas contains the white statistics/timer module at its top. That white module contains only statistics, timer, Pomodoro, time controls and goal editor. The note title, body and existing note actions are directly on the blue canvas below it.

Protected statistics are `Всего`, `Сделано сегодня`, `Нужно в день` and `Осталось`. Keep them visible at the top, including when the goal editor is collapsed. Do not remove, hide, rename, reorder, move, replace or alter their formulas. Reuse the established time-plan and goal calculations.

Goal UI sits on the right of the white timer module. When collapsed it uses the quiet line-icon form `Цель 400 ч` with a down chevron; when expanded it uses an up chevron and expands downward. Goal and hours are not bold. Keep autosave, hide the visible text `Сохраняется автоматически`, and keep the normal-size `Сохранить цель` button. Opening and closing the goal must not move or resize the timer, title, body, lower controls or other modal content. The panel has no internal scrollbar and no added horizontal borders or heavy separate pane border.

Noma supports named UI extension points. The first canonical slot is `timer.right.collapsed`, in the unused right-side area of the timer module when the goal editor is collapsed. Empty slots render no visible UI. Core owns data and business behavior. Plugins use documented contracts and do not directly modify Core persistence. A plugin runtime and public SDK do not yet exist.

Treat every ordinary UI task as a minimal patch, not a redesign. Preserve unrelated controls, buttons, labels, metrics, indicators, menus, panels, breadcrumbs, cards, actions and functionality. A user screenshot is the visual baseline; the requested change is its delta. Do not add text that was not explicitly requested: no helper text, explanatory captions, subtitles, badges, suffixes, extra labels, toolbars or descriptions. Use `Проект`; never add labels such as `Проект · папка`, `Заметка · запись` or `Заметка · самостоятельная запись` without an explicit request.

Do not create tests for normal UI/layout work. Run `npm run typecheck` and `npm run build` unless the user requests a broader suite. Do not push, tag, release or rebuild portable output without explicit authorization. The official portable output is only `release/Noma-portable`; never create `outputs/Noma-portable`. Never commit generated `release/`, `dist/`, `node_modules/` or temporary artifacts.

Important modules: `src/data.ts` and Dexie persistence; `src/noteEditing.ts` and `src/noteUpdateService.ts` for note writes; `src/trackingRepository.ts`, `src/goalRepository.ts` and `src/timePlan.ts` for calculations; `src/TimeTrackingPanel.tsx`, `src/GoalPanel.tsx` and `src/TimeSummary.tsx` for time UI; `src/NoteEditorModal.tsx` for the shared note editor; `src/ProjectView.tsx` for project boards; `src/NoteLocation.tsx` for tree navigation; and the drawing, photos and protection modules for their respective core content behavior.
