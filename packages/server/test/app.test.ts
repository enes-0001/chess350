// Integration tests: a real server on a random port + real socket.io clients (SDD §16.1).
import { C2S, type Ack } from '@chess350/core';
import { io as connect, type Socket } from 'socket.io-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp, type App } from '../src/app';
import { createLogger } from '../src/infra/logger';

const ALLOWED = 'http://localhost:5173';

let app: App;
let url: string;
const sockets: Socket[] = [];

function client(origin?: string): Socket {
  const s = connect(url, {
    transports: ['websocket'],
    reconnection: false,
    extraHeaders: origin ? { origin } : {},
  });
  sockets.push(s);
  return s;
}

const connected = (s: Socket) =>
  new Promise<'connected' | 'rejected'>((resolve) => {
    s.on('connect', () => resolve('connected'));
    s.on('connect_error', () => resolve('rejected'));
  });

const emit = <T>(s: Socket, event: string, payload: unknown) =>
  new Promise<Ack<T>>((resolve) => s.emit(event, payload, resolve));

beforeEach(async () => {
  app = createApp({
    config: { port: 0, allowedOrigins: [ALLOWED], logLevel: 'silent', clientDist: null },
    logger: createLogger('silent'),
  });
  const port = await app.listen(0);
  url = `http://localhost:${port}`;
});

afterEach(async () => {
  sockets.splice(0).forEach((s) => s.close());
  await app.close();
});

describe('server smoke', () => {
  it('GET /healthz reports ok', async () => {
    const res = await fetch(`${url}/healthz`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, rooms: 0 });
  });

  it('T-P6: rejects sockets from a foreign origin, accepts the allowed one', async () => {
    expect(await connected(client('https://evil.example'))).toBe('rejected');
    expect(await connected(client(ALLOWED))).toBe('connected');
  });

  it('T-P1: invalid payloads are answered with BAD_REQUEST, not a crash', async () => {
    const s = client(ALLOWED);
    await connected(s);
    const ack = await emit(s, C2S.gameMove, { uci: 'not-a-move', ply: 0 });
    expect(ack).toMatchObject({ ok: false, error: { code: 'BAD_REQUEST' } });
    const ack2 = await emit(s, C2S.roomJoin, { code: '???' });
    expect(ack2).toMatchObject({ ok: false, error: { code: 'BAD_REQUEST' } });
  });

  it.todo('T-P2: unknown room → ROOM_NOT_FOUND');
  it.todo('T-P3: full game over sockets ends in mate; both clients get identical final snapshots');
  it.todo('T-P4: disconnect + reconnect resumes with the same state');
  it.todo('T-P5: rate limits trigger');
  it.todo('T-P7: chat sanitisation');
});
