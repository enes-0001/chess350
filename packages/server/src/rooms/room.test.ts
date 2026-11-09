// Test catalogue for the Room aggregate (SDD §16.2). Use FakeTime from ../infra/time.
// Replace each `todo` with a real test in the backlog task that implements it.
import { describe, it } from 'vitest';

describe('Room / RoomManager', () => {
  it.todo(
    'T-M1: seat assignment — creator colour, random resolved, 2nd joiner gets other seat, 3rd spectator, cap → ROOM_FULL',
  );
  it.todo('T-M2: token resumes the seat; a wrong token does not');
  it.todo('T-M3: two joins at the same moment — only one gets the seat');
  it.todo(
    'T-M4: NOT_YOUR_TURN / STALE_PLY / duplicate (seat, ply, uci) is acked ok without re-applying',
  );
  it.todo('T-M5: abort only before ply 2; first-move timeout (30 s) aborts');
  it.todo('T-M6: resign');
  it.todo('T-M7: draw offer / accept / decline; a move declines; one offer per own move');
  it.todo('T-M8: abandon after 60 s; reconnect at 59 s cancels it; both disconnected → no result');
  it.todo('T-M9: sweep deletes finished rooms after 30 min and inactive rooms after 24 h');
  it.todo('T-M10: version increments on every change and only then');
});
