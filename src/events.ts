import { Message } from './store/messages/types';
import EventEmitter from 'events';

export const bus = new EventEmitter();

export const MESSAGE_RECEIVED = 'message';
export const USER_MUTED = 'muted';
export const MESSAGE_DELETED = 'delete';
export const MESSAGE_PINNED = 'pinned';

export type MessageReceivedEvent = {
  messageId: string;
  channelId: Uint8Array;
  update: boolean;
}

export const onMessageReceived = (
  messageId: string,
  channelId: Uint8Array,
  update: boolean
) => {
  const messageEvent: MessageReceivedEvent = {
    messageId,
    channelId,
    update
  }

  bus.emit(MESSAGE_RECEIVED, messageEvent);
}

export type UserMutedEvent = {
  channelId: Uint8Array;
  pubkey: string;
  unmute: boolean;
}

export const onMutedUser = (
  channelId: Uint8Array,
  pubkey: string,
  unmute: boolean
) => {
  const event: UserMutedEvent = { channelId, pubkey, unmute };
  bus.emit(USER_MUTED, event);
}

export type MessageDeletedEvent = {
  messageId: string;
}

export const onMessageDelete = (msgId: Uint8Array) => {
  const messageId = Buffer.from(msgId).toString('base64');
  const event: MessageDeletedEvent = { messageId };
  bus.emit(MESSAGE_DELETED, event);
};

export type MessagePinEvent = Message;
