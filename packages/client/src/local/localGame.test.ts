import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  initialLocalState,
  loadLocalState,
  localReducer,
  saveLocalState,
  type LocalAction,
  type LocalState,
} from './localGame';

const run = (...actions: LocalAction[]): LocalState =>
  actions.reduce(localReducer, initialLocalState);
const mv = (uci: string): LocalAction => ({ type: 'move', uci });

describe('localReducer (F12, F13, F22)', () => {
  it('applies legal moves and ignores illegal ones', () => {
    expect(run(mv('e2e4'), mv('e7e5')).moves).toEqual(['e2e4', 'e7e5']);
    const s = run(mv('e2e4'));
    expect(localReducer(s, mv('e2e4'))).toBe(s); // illegal for black: same object
  });

  it('undo / redo, and a new move clears redo', () => {
    let s = run(mv('e2e4'), mv('e7e5'), { type: 'undo' });
    expect(s).toMatchObject({ moves: ['e2e4'], redo: ['e7e5'] });
    s = localReducer(s, { type: 'redo' });
    expect(s).toMatchObject({ moves: ['e2e4', 'e7e5'], redo: [] });
    s = run(mv('e2e4'), mv('e7e5'), { type: 'undo' }, { type: 'undo' }, mv('d2d4'));
    expect(s).toMatchObject({ moves: ['d2d4'], redo: [] });
  });

  it('undo/redo at the edges are no-ops', () => {
    expect(run({ type: 'undo' })).toBe(initialLocalState);
    expect(run({ type: 'redo' })).toBe(initialLocalState);
  });

  it('no moves after the game is over', () => {
    const mate = run(mv('f2f3'), mv('e7e5'), mv('g2g4'), mv('d8h4'));
    expect(localReducer(mate, mv('a2a3'))).toBe(mate);
  });

  it('review: view a past ply (clamped), board read-only, last ply returns to live', () => {
    let s = run(mv('e2e4'), mv('e7e5'), mv('g1f3'));
    s = localReducer(s, { type: 'view', ply: 1 });
    expect(s.viewPly).toBe(1);
    expect(localReducer(s, mv('b8c6'))).toBe(s);
    expect(localReducer(s, { type: 'view', ply: -5 }).viewPly).toBe(0);
    expect(localReducer(s, { type: 'view', ply: 99 }).viewPly).toBeNull();
    expect(localReducer(s, { type: 'view', ply: null }).viewPly).toBeNull();
  });

  it('reset', () => {
    expect(run(mv('e2e4'), { type: 'reset' })).toEqual(initialLocalState);
  });
});

describe('local persistence', () => {
  afterEach(() => vi.unstubAllGlobals());

  const memoryStorage = () => {
    const data = new Map<string, string>();
    return {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
    };
  };

  it('round-trips moves and redo', () => {
    vi.stubGlobal('localStorage', memoryStorage());
    saveLocalState({ moves: ['e2e4'], redo: ['e7e5'], viewPly: 0 });
    expect(loadLocalState()).toEqual({ moves: ['e2e4'], redo: ['e7e5'], viewPly: null });
  });

  it('ignores corrupt or invalid data', () => {
    const store = memoryStorage();
    vi.stubGlobal('localStorage', store);
    store.setItem('350chess:local-game', '{not json');
    expect(loadLocalState()).toEqual(initialLocalState);
    store.setItem('350chess:local-game', JSON.stringify({ moves: ['e2e5'], redo: [] }));
    expect(loadLocalState()).toEqual(initialLocalState);
  });

  it('survives storage that throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    });
    expect(loadLocalState()).toEqual(initialLocalState);
    expect(() => saveLocalState(initialLocalState)).not.toThrow();
  });
});
