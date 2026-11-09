import { describe, expect, it } from 'vitest';
import { FakeTime } from './time';

describe('FakeTime', () => {
  it('runs due timers in order and moves now() to each timer', () => {
    const t = new FakeTime(0);
    const log: string[] = [];
    t.setTimeout(() => log.push(`b@${t.now()}`), 200);
    t.setTimeout(() => log.push(`a@${t.now()}`), 100);
    t.advance(150);
    expect(log).toEqual(['a@100']);
    expect(t.now()).toBe(150);
    t.advance(100);
    expect(log).toEqual(['a@100', 'b@200']);
    expect(t.now()).toBe(250);
  });

  it('clearTimeout cancels', () => {
    const t = new FakeTime(0);
    let fired = false;
    const h = t.setTimeout(() => (fired = true), 10);
    t.clearTimeout(h);
    t.advance(100);
    expect(fired).toBe(false);
    expect(t.pending).toBe(0);
  });

  it('timers scheduled inside a callback also fire if due', () => {
    const t = new FakeTime(0);
    const log: number[] = [];
    t.setTimeout(() => {
      log.push(t.now());
      t.setTimeout(() => log.push(t.now()), 10);
    }, 10);
    t.advance(30);
    expect(log).toEqual([10, 20]);
  });
});
