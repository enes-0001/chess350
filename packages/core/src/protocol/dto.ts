// Server → client payload types (SDD §11.4–§11.5).

import type { Color, Outcome, TimeControl } from '../types';

export type RoomStatus = 'waiting' | 'active' | 'finished' | 'aborted';
export type Role = Color | 'spectator';

export interface Presence {
  white: boolean;
  black: boolean;
  spectators: number;
}

export interface ChatMessage {
  id: number;
  from: Role;
  text: string;
  /** Server timestamp, ms since epoch. */
  at: number;
}

export interface ClockSnapshot {
  /** Remaining ms, already computed at send time for the running side. */
  whiteMs: number;
  blackMs: number;
  running: Color | null;
}

/** Full public state of a room. Sent after every change (invariant #6). */
export interface RoomState {
  v: number;
  code: string;
  status: RoomStatus;
  timeControl: TimeControl | null;
  fen: string;
  moves: { uci: string; san: string }[];
  turn: Color;
  ply: number;
  inCheck: boolean;
  lastMove: { from: string; to: string } | null;
  clock: ClockSnapshot | null;
  presence: Presence;
  seatsTaken: { white: boolean; black: boolean };
  drawOfferBy: Color | null;
  takebackOfferBy: Color | null;
  outcome: Outcome | null;
  endedAt: number | null;
  /** Only included in the room:join ack, not in every snapshot. */
  chat?: ChatMessage[];
}

// ---- ack payloads ----
export interface RoomCreateResult {
  code: string;
  token: string;
  color: Color;
}

export interface RoomJoinResult {
  role: Role;
  /** Present only when the server just assigned a new seat. Store it in localStorage. */
  token?: string;
  state: RoomState;
}

export type RoomClosedReason = 'expired' | 'cancelled' | 'server-restart';
