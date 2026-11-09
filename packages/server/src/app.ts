// Composition root: wires config, HTTP, Socket.IO and rooms. Tests create it on port 0.
import { createServer, type Server as HttpServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Server } from 'socket.io';
import type { ServerConfig } from './config';
import { createHttpApp } from './http';
import { createLogger, type Logger } from './infra/logger';
import { systemScheduler, systemTime, type Scheduler, type TimeSource } from './infra/time';
import { RoomManager } from './rooms/roomManager';
import { registerSocketHandlers } from './transport/socket';

export interface AppDeps {
  config: ServerConfig;
  time?: TimeSource;
  scheduler?: Scheduler;
  logger?: Logger;
}

export interface App {
  http: HttpServer;
  io: Server;
  rooms: RoomManager;
  listen(port?: number): Promise<number>;
  close(): Promise<void>;
}

export function createApp({
  config,
  time = systemTime,
  scheduler = systemScheduler,
  logger = createLogger(config.logLevel),
}: AppDeps): App {
  const startedAt = time.now();
  const rooms = new RoomManager({ time, scheduler });

  const httpApp = createHttpApp({
    clientDist: config.clientDist,
    health: () => ({
      rooms: rooms.size,
      sockets: io.engine.clientsCount,
      uptimeSec: Math.round((time.now() - startedAt) / 1000),
    }),
  });
  const http = createServer(httpApp);

  const io = new Server(http, {
    maxHttpBufferSize: 16 * 1024, // SDD §11.1
    pingInterval: 10_000,
    pingTimeout: 5_000,
    serveClient: false,
    // Cross-site WebSocket hijacking protection (SDD §11.1, §12).
    // Browsers always send Origin; non-browser tools (tests, load test) may omit it.
    allowRequest: (req, callback) => {
      const origin = req.headers.origin;
      callback(null, origin === undefined || config.allowedOrigins.includes(origin));
    },
  });

  registerSocketHandlers(io, { rooms, logger });

  return {
    http,
    io,
    rooms,
    listen: (port = config.port) =>
      new Promise((resolve) => {
        http.listen(port, () => resolve((http.address() as AddressInfo).port));
      }),
    close: () =>
      new Promise((resolve) => {
        io.close(() => resolve());
      }),
  };
}
