// Room aggregate (SDD §7.2–§7.5, §10). ALL "who may do what when" rules live here.
// Rules for this file:
//   - no `await` anywhere in command handling (invariant #4)
//   - time only via injected TimeSource/Scheduler (invariant #3, enforced by ESLint)
//   - every change bumps `version` (invariant #6)
// Backlog: S3-01 (seats/join), S3-02 (moves), S3-03 (resign/draw/abort), S4-02 (timers).

import {
  notImplemented,
  type Ack,
  type ChatMessage,
  type ClockState,
  type Color,
  type Outcome,
  type RoomState,
  type RoomStatus,
  type TimeControl,
} from '@chess350/core';
import type { Scheduler, TimerHandle, TimeSource } from '../infra/time';

export interface Seat {
  tokenHash: string;
  /** A seat may be open in several tabs. */
  sockets: Set<string>;
  disconnectedAt: number | null;
}

export interface RoomDeps {
  time: TimeSource;
  scheduler: Scheduler;
}

export class Room {
  version = 0;
  status: RoomStatus = 'waiting';
  readonly seats: { white: Seat | null; black: Seat | null } = { white: null, black: null };
  readonly spectators = new Set<string>();
  clock: ClockState | null = null;
  drawOfferBy: Color | null = null;
  takebackOfferBy: Color | null = null;
  outcome: Outcome | null = null;
  endedAt: number | null = null;
  readonly chat: ChatMessage[] = [];
  readonly timers: { firstMove?: TimerHandle; flag?: TimerHandle; abandon?: TimerHandle } = {};
  lastActivityAt: number;

  constructor(
    readonly code: string,
    readonly timeControl: TimeControl | null,
    private readonly deps: RoomDeps,
  ) {
    this.lastActivityAt = deps.time.now();
  }

  /** Public snapshot for broadcasting (SDD §11.5). */
  snapshot(): RoomState {
    return notImplemented('S3-01 Room.snapshot', 'SDD §11.5');
  }

  move(_seat: Color, _uci: string, _ply: number): Ack {
    return notImplemented('S3-02 Room.move', 'SDD §10, §11.2');
  }
}
