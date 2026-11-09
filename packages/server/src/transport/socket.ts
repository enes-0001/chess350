// Socket.IO wiring (SDD §7.1, §11). Each C2S event: schema → handler → ack.
// The handlers below are placeholders that validate input and answer NOT_ALLOWED until the
// backlog task in the message implements them.
import {
  C2S,
  chatSendSchema,
  emptySchema,
  fail,
  gameDrawSchema,
  gameMoveSchema,
  gameTakebackSchema,
  roomCreateSchema,
  roomJoinSchema,
} from '@chess350/core';
import type { Server } from 'socket.io';
import type { Logger } from '../infra/logger';
import type { RoomManager } from '../rooms/roomManager';
import { onCommand } from './handler';

export interface SocketDeps {
  rooms: RoomManager;
  logger: Logger;
}

const todo = (task: string) => fail('NOT_ALLOWED', `Not implemented yet (${task})`);

export function registerSocketHandlers(io: Server, deps: SocketDeps): void {
  const { logger } = deps;

  io.on('connection', (socket) => {
    logger.debug({ socket: socket.id }, 'socket connected');

    onCommand(socket, C2S.roomCreate, roomCreateSchema, logger, () => todo('S3-01'));
    onCommand(socket, C2S.roomJoin, roomJoinSchema, logger, () => todo('S3-01'));
    onCommand(socket, C2S.roomCancel, emptySchema, logger, () => todo('S3-03'));
    onCommand(socket, C2S.gameMove, gameMoveSchema, logger, () => todo('S3-02'));
    onCommand(socket, C2S.gameResign, emptySchema, logger, () => todo('S3-03'));
    onCommand(socket, C2S.gameAbort, emptySchema, logger, () => todo('S3-03'));
    onCommand(socket, C2S.gameDraw, gameDrawSchema, logger, () => todo('S3-03'));
    onCommand(socket, C2S.gameTakeback, gameTakebackSchema, logger, () => todo('S5-04'));
    onCommand(socket, C2S.chatSend, chatSendSchema, logger, () => todo('S5-01'));

    socket.on('disconnect', (reason) => {
      logger.debug({ socket: socket.id, reason }, 'socket disconnected');
      // S4-03: update seat presence, arm abandon timer (SDD §7.5)
    });
  });
}
