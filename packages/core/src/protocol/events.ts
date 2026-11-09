// Socket.IO event names (SDD §11.3–§11.4). Use these constants, never string literals.

/** Client → server. Every one of these carries an ack callback. */
export const C2S = {
  roomCreate: 'room:create',
  roomJoin: 'room:join',
  roomCancel: 'room:cancel',
  gameMove: 'game:move',
  gameResign: 'game:resign',
  gameAbort: 'game:abort',
  gameDraw: 'game:draw',
  gameTakeback: 'game:takeback',
  chatSend: 'chat:send',
} as const;

/** Server → client. */
export const S2C = {
  roomState: 'room:state',
  roomPresence: 'room:presence',
  chatMessage: 'chat:message',
  roomClosed: 'room:closed',
} as const;

export type C2SEvent = (typeof C2S)[keyof typeof C2S];
export type S2CEvent = (typeof S2C)[keyof typeof S2C];
