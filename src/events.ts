import type { TypedEventEmitter } from 'src/types/emitter';
import type { Message, DMReceivedEvent, MessageReceivedEvent, UserMutedEvent, MessageDeletedEvent, MessagePinEvent, MessageUnPinEvent, NicknameUpdatedEvent, NotificationUpdateEvent, AdminKeysUpdateEvent, DmTokenUpdateEvent } from 'src/types';
import EventEmitter from 'events';
import delay from 'delay';
import { Decoder, adminKeysUpdateDecoder, dmTokenUpdateDecoder, messageDeletedEventDecoder, messageReceivedEventDecoder, nicknameUpdatedEventDecoder, notificationUpdateEventDecoder, userMutedEventDecoder } from '@utils/decoders';
import { AccountSyncService } from './hooks/useAccountSync';

export enum AppEvents {
  MESSAGE_PINNED = 'pinned',
  MESSAGE_UNPINNED = 'unpinned',
  DM_RECEIVED = 'dm-received',
  GOOGLE_TOKEN = 'google-token',
  DROPBOX_TOKEN = 'dropbox-token',
  REMOTE_STORE_INITIALIZED = 'remote-store-initialized',
  CMIX_SYNCED = 'cmix-synced'
}

export enum ChannelEvents {
  NICKNAME_UPDATE = 1000,
  NOTIFICATION_UPDATE = 2000,
  MESSAGE_RECEIVED = 3000,
  USER_MUTED = 4000,
  MESSAGE_DELETED = 5000,
  ADMIN_KEY_UPDATE = 6000,
  DM_TOKEN_UPDATE = 7000
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
  [AppEvents.REMOTE_STORE_INITIALIZED]: () => void;
  [AppEvents.CMIX_SYNCED]: (service: AccountSyncService) => void;
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


export const awaitEvent = async (evt: AppEvents | ChannelEvents, timeout = 10000) => {
  let listener: () => void = () => {};
  let resolved = false;
  const promise = new Promise<void>((resolve) => {
    listener = resolve;
    bus.addListener(evt, () => {
      resolved = true;
      resolve();
    });
  });
  await Promise.race([
    promise,
    delay(timeout).then(() => {
      if (!resolved) {
        throw new Error(`Awaiting event ${evt} timed out.`)
      }
    })
  ]);

  bus.removeListener(evt, listener);
}
