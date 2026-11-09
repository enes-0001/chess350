// Owns all rooms in memory (SDD §7.1, ADR-005). Backlog: S3-01, S4-04 (sweep).
import { notImplemented, type RoomCreatePayload } from '@chess350/core';
import type { Scheduler, TimeSource } from '../infra/time';
import type { Room } from './room';

export interface RoomManagerDeps {
  time: TimeSource;
  scheduler: Scheduler;
}

export class RoomManager {
  private readonly rooms = new Map<string, Room>();
  /** Deleted codes → deletion time. Late joiners get ROOM_EXPIRED; codes are never reused. */
  private readonly tombstones = new Map<string, number>();

  constructor(private readonly deps: RoomManagerDeps) {}

  get size(): number {
    return this.rooms.size;
  }

  get(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  isExpired(code: string): boolean {
    return this.tombstones.has(code);
  }

  /** Creates a room + the creator's seat. Returns code, token, resolved colour (SDD §7.4). */
  create(_payload: RoomCreatePayload): { code: string; token: string; room: Room } {
    void this.deps;
    return notImplemented('S3-01 RoomManager.create', 'SDD §7.4');
  }

  /** Every 60 s: delete finished/aborted rooms after 30 min and inactive rooms after 24 h. */
  sweep(): void {
    return notImplemented('S4-04 RoomManager.sweep', 'SDD §7.5');
  }
}
