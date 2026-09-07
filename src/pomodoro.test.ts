import { describe,expect,it } from 'vitest';
import { createPomodoro,pausePomodoro,pomodoroElapsed,startPomodoro,stopPomodoro,tickPomodoro } from './pomodoro';

describe('pomodoro state',()=>{
 it('starts a work interval and completes it without a fixed break timer',()=>{const idle=createPomodoro(25);const work=startPomodoro(idle,1000);expect(work.status).toBe('work');const done=tickPomodoro(work,1000+25*60_000);expect(done.status).toBe('work-complete');expect(pomodoroElapsed(done,999999)).toBe(25*60_000)});
 it('pauses and resumes the same work interval',()=>{const work=startPomodoro(createPomodoro(25),1000);const paused=pausePomodoro(work,6000);expect(paused.elapsedMs).toBe(5000);expect(paused.startedAt).toBeNull();const resumed=startPomodoro(paused,10000);expect(pomodoroElapsed(resumed,12000)).toBe(7000)});
 it('starts a new cycle after the user continues from completed state',()=>{const done=tickPomodoro(startPomodoro(createPomodoro(1),0),60000);const next=startPomodoro(done,100000);expect(next.status).toBe('work');expect(next.elapsedMs).toBe(0);expect(pomodoroElapsed(next,100000)).toBe(0)});
 it('stop resets the cycle',()=>{const stopped=stopPomodoro(startPomodoro(createPomodoro(25),1));expect(stopped.status).toBe('idle');expect(stopped.elapsedMs).toBe(0);expect(stopped.durationMs).toBe(25*60_000)});
});



