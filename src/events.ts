import type { TypedEventEmitter } from 'src/types/emitter';
import type { Message, DMReceivedEvent, MessageReceivedEvent, UserMutedEvent, MessageDeletedEvent, MessagePinEvent, MessageUnPinEvent, NicknameUpdatedEvent, NotificationUpdateEvent, AdminKeysUpdateEvent, DmTokenUpdateEvent } from 'src/types';
import EventEmitter from 'events';
import delay from 'delay';
import { Decoder, adminKeysUpdateDecoder, dmTokenUpdateDecoder, messageDeletedEventDecoder, messageReceivedEventDecoder, nicknameUpdatedEventDecoder, notificationUpdateEventDecoder, userMutedEventDecoder } from '@utils/decoders';

export enum AppEvents {
  MESSAGE_PINNED = 'pinned',
  MESSAGE_UNPINNED = 'unpinned',
  DM_RECEIVED = 'dm-received',
  GOOGLE_TOKEN = 'google-token',
  DROPBOX_TOKEN = 'dropbox-token'
}

export enum ChannelEvents {
  NICKNAME_UPDATE = 0,
  NOTIFICATION_UPDATE = 1,
  MESSAGE_RECEIVED = 2,
  USER_MUTED = 3,
  MESSAGE_DELETED = 4,
  ADMIN_KEY_UPDATE = 5,
  DM_TOKEN_UPDATE = 6
}

export type ChannelEventMap = {
  [ChannelEvents.NICKNAME_UPDATE]: NicknameUpdatedEvent;
  [ChannelEvents.NOTIFICATION_UPDATE]: NotificationUpdateEvent;
  [ChannelEvents.MESSAGE_RECEIVED]: MessageReceivedEvent;
  [ChannelEvents.MESSAGE_DELETED]: MessageDeletedEvent;
  [ChannelEvents.USER_MUTED]: UserMutedEvent;
  [ChannelEvents.ADMIN_KEY_UPDATE]: AdminKeysUpdateEvent;
  [ChannelEvents.DM_TOKEN_UPDATE]: DmTokenUpdateEvent;
}

type EventHandlers = {
  [P in keyof ChannelEventMap]: (event: ChannelEventMap[P]) => void;
} & {
  [AppEvents.MESSAGE_PINNED]: (event: MessagePinEvent) => void;
  [AppEvents.MESSAGE_UNPINNED]: (event: MessageUnPinEvent) => void;
  [AppEvents.DM_RECEIVED]: (event: DMReceivedEvent) => void;
  [AppEvents.GOOGLE_TOKEN]: (event: string) => void;
  [AppEvents.DROPBOX_TOKEN]: (event: string) => void;
}

const cmixDecoderMap: { [P in keyof ChannelEventMap]: Decoder<ChannelEventMap[P]> } = {
  [ChannelEvents.MESSAGE_RECEIVED]: messageReceivedEventDecoder,
  [ChannelEvents.NOTIFICATION_UPDATE]: notificationUpdateEventDecoder,
  [ChannelEvents.MESSAGE_DELETED]: messageDeletedEventDecoder,
  [ChannelEvents.USER_MUTED]: userMutedEventDecoder,
  [ChannelEvents.NICKNAME_UPDATE]: nicknameUpdatedEventDecoder,
  [ChannelEvents.DM_TOKEN_UPDATE]: dmTokenUpdateDecoder,
  [ChannelEvents.ADMIN_KEY_UPDATE]: adminKeysUpdateDecoder
}

export const bus = new EventEmitter() as TypedEventEmitter<EventHandlers>;

export type ChannelEventHandler = (eventType: ChannelEvents, data: unknown) => void;

export const onMessagePinned = (message: Message) => {
  bus.emit(AppEvents.MESSAGE_PINNED, message);
}

export const onMessageUnpinned = (message: Message) => {
  bus.emit(AppEvents.MESSAGE_UNPINNED, message);
}

export type DMReceivedCallback = (uuid: string, pubkey: Uint8Array, update: boolean, updateConversation: boolean) => void;

export const onDmReceived: DMReceivedCallback = (uuid, pubkey, update, updateConversation) => {
  bus.emit(AppEvents.DM_RECEIVED, {
    messageUuid: uuid,
    pubkey,
    update,
    conversationUpdated: updateConversation
  });
}

export const handleChannelEvent: ChannelEventHandler = (eventType, data) => {
  const decoder = cmixDecoderMap[eventType];
  if (!decoder) {
    console.warn('Unhandled event:', eventType, data);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bus.emit(eventType, decoder(data) as any);
  }
}


export const awaitEvent = async (evt: AppEvents | ChannelEvents) => {
  let listener: () => void = () => {};
  await Promise.race([
    new Promise<void>((resolve) => {
      listener = resolve;
      bus.addListener(evt, () => { resolve() });
    }),
    delay(10000) // 10 second timeout
  ]);

  bus.removeListener(evt, listener);
}
