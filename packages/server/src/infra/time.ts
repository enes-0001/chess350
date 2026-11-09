// Injected time (invariant #3, ADR-009). Domain code (rooms/) gets these via its constructor
// and never touches Date.now() or setTimeout directly. Tests use FakeTime.

export type TimerHandle = unknown;

export interface TimeSource {
  /** Milliseconds since epoch. */
  now(): number;
}

export interface Scheduler {
  setTimeout(fn: () => void, ms: number): TimerHandle;
  clearTimeout(handle: TimerHandle): void;
}

export const systemTime: TimeSource = { now: () => Date.now() };

export const systemScheduler: Scheduler = {
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
};

interface FakeTimer {
  id: number;
  at: number;
  fn: () => void;
}

/**
 * Deterministic time for tests: `advance(ms)` moves the clock and runs due timers in order.
 * Example: a 60 s abandon timer is tested in microseconds with `time.advance(60_000)`.
 */
export class FakeTime implements TimeSource, Scheduler {
  private current: number;
  private nextId = 1;
  private timers: FakeTimer[] = [];

  constructor(start = 1_700_000_000_000) {
    this.current = start;
  }

  now(): number {
    return this.current;
  }

  setTimeout(fn: () => void, ms: number): TimerHandle {
    const timer = { id: this.nextId++, at: this.current + Math.max(0, ms), fn };
    this.timers.push(timer);
    return timer.id;
  }

  clearTimeout(handle: TimerHandle): void {
    this.timers = this.timers.filter((t) => t.id !== handle);
  }

  /** Number of timers still waiting. */
  get pending(): number {
    return this.timers.length;
  }

  advance(ms: number): void {
    const target = this.current + ms;
    for (;;) {
      const due = this.timers
        .filter((t) => t.at <= target)
        .sort((a, b) => a.at - b.at || a.id - b.id)[0];
      if (!due) break;
      this.timers = this.timers.filter((t) => t !== due);
      this.current = due.at;
      due.fn(); // may schedule new timers; the loop picks them up if they are due
    }
    this.current = target;
  }
}
