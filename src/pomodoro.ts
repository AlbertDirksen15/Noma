export type PomodoroStatus = 'idle' | 'work' | 'work-complete';

export type PomodoroState = { status: PomodoroStatus; durationMs: number; startedAt: number | null; elapsedMs: number };

export const DEFAULT_POMODORO_MINUTES = 25;

export const createPomodoro = (minutes = DEFAULT_POMODORO_MINUTES): PomodoroState => ({ status: 'idle', durationMs: Math.max(1, minutes) * 60_000, startedAt: null, elapsedMs: 0 });

export const startPomodoro = (state: PomodoroState, now = Date.now()): PomodoroState => ({ ...state, status: 'work', startedAt: now - (state.status === 'work-complete' ? 0 : state.elapsedMs), elapsedMs: state.status === 'work-complete' ? 0 : state.elapsedMs });

export const pausePomodoro = (state: PomodoroState, now = Date.now()): PomodoroState => state.status === 'work' && state.startedAt !== null ? { ...state, startedAt: null, elapsedMs: Math.min(state.durationMs, Math.max(0, now - state.startedAt)) } : state;

export const stopPomodoro = (state: PomodoroState): PomodoroState => createPomodoro(state.durationMs / 60_000);

export const pomodoroElapsed = (state: PomodoroState, now = Date.now()) => state.status === 'work' && state.startedAt !== null ? Math.min(state.durationMs, Math.max(0, now - state.startedAt)) : state.elapsedMs;

export const tickPomodoro = (state: PomodoroState, now = Date.now()): PomodoroState => { const elapsed = pomodoroElapsed(state, now); return state.status === 'work' && elapsed >= state.durationMs ? { ...state, status: 'work-complete', startedAt: null, elapsedMs: state.durationMs } : { ...state, elapsedMs: elapsed }; };

export const setPomodoroDuration = (state: PomodoroState, minutes: number): PomodoroState => ({ ...createPomodoro(minutes), status: state.status === 'work' ? state.status : 'idle' });



