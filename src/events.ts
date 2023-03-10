import { Message } from './store/messages/types';
import EventEmitter from 'events';
import delay from 'delay';

export const bus = new EventEmitter();

export enum Event {
  DM_RECEIVED = 'dm-message',
  MESSAGE_RECEIVED = 'message',
  USER_MUTED = 'muted',
  MESSAGE_DELETED = 'delete',
  MESSAGE_PINNED = 'pinned',
  MESSAGE_UNPINNED = 'unpinned'
}

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

  bus.emit(Event.MESSAGE_RECEIVED, messageEvent);
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
  bus.emit(Event.USER_MUTED, event);
}

export type MessageDeletedEvent = {
  messageId: string;
}

export const onMessageDelete = (msgId: Uint8Array) => {
  const messageId = Buffer.from(msgId).toString('base64');
  const event: MessageDeletedEvent = { messageId };
  bus.emit(Event.MESSAGE_DELETED, event);
};

export const onMessagePinned = (message: Message) => {
  bus.emit(Event.MESSAGE_PINNED, message);
}

export const onMessageUnpinned = (message: Message) => {
  bus.emit(Event.MESSAGE_UNPINNED, message);
}


export type MessagePinEvent = Message;
export type MessageUnPinEvent = Message;

export type DMReceivedEvent = {
  messageUuid: string;
  pubkey: Uint8Array;
  update: boolean;
  conversationUpdated: boolean;
}

export const onDmReceived = (
  messageUuid: string,
  pubkey: Uint8Array,
  update: boolean,
  conversationUpdated: boolean
) => {
  const messageEvent: DMReceivedEvent = {
    messageUuid,
    pubkey,
    update,
    conversationUpdated
  }

  bus.emit(Event.DM_RECEIVED, messageEvent);
}


export const awaitEvent = async (evt: Event) => {
  let listener: () => void = () => {};
  await Promise.race([
    new Promise<void>((resolve) => {
      listener = resolve;
      bus.addListener(evt, resolve)
    }),
    delay(10000) // 10 second timeout
  ]);

  bus.removeListener(evt, listener);
}
