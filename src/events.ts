import type { TypedEventEmitter } from 'src/types/emitter';
import type { Message, DMReceivedEvent, MessageReceivedEvent, UserMutedEvent, MessageDeletedEvent, MessagePinEvent, MessageUnPinEvent, NicknameUpdatedEvent, NotificationUpdateEvent, AdminKeysUpdateEvent, ChannelUpdateEvent, DMNotificationsUpdateEvent } from 'src/types';
import EventEmitter from 'events';
import delay from 'delay';
import { Decoder, adminKeysUpdateDecoder, channelUpdateEventDecoder, dmNotificationsUpdateEventDecoder, messageDeletedEventDecoder, messageReceivedEventDecoder, nicknameUpdatedEventDecoder, notificationUpdateEventDecoder, userMutedEventDecoder } from '@utils/decoders';
import { AccountSyncService } from './hooks/useAccountSync';
import { RemoteKVWrapper } from '@contexts/remote-kv-context';
import { DmNotificationUpdateCallback } from '@contexts/utils-context';
import { decoder } from './utils';

export enum AppEvents {
  MESSAGE_PINNED = 'pinned',
  MESSAGE_UNPINNED = 'unpinned',
  DM_RECEIVED = 'dm-received',
  GOOGLE_TOKEN = 'google-token',
  DROPBOX_TOKEN = 'dropbox-token',
  CHANNEL_MANAGER_LOADED = 'channel-manager-loaded',
  REMOTE_STORE_INITIALIZED = 'remote-store-initialized',
  CMIX_SYNCED = 'cmix-synced',
  REMOTE_KV_INITIALIZED = 'remote-kv-initialized',
  DM_NOTIFICATION_UPDATE = 'dm-notifications-update',
}

export enum ChannelEvents {
  NICKNAME_UPDATE = 1000,
  NOTIFICATION_UPDATE = 2000,
  MESSAGE_RECEIVED = 3000,
  USER_MUTED = 4000,
  MESSAGE_DELETED = 5000,
  ADMIN_KEY_UPDATE = 6000,
  CHANNEL_UPDATE = 7000
}

export type ChannelEventMap = {
  [ChannelEvents.NICKNAME_UPDATE]: NicknameUpdatedEvent;
  [ChannelEvents.NOTIFICATION_UPDATE]: NotificationUpdateEvent;
  [ChannelEvents.MESSAGE_RECEIVED]: MessageReceivedEvent;
  [ChannelEvents.MESSAGE_DELETED]: MessageDeletedEvent;
  [ChannelEvents.USER_MUTED]: UserMutedEvent;
  [ChannelEvents.ADMIN_KEY_UPDATE]: AdminKeysUpdateEvent;
  [ChannelEvents.CHANNEL_UPDATE]: ChannelUpdateEvent[];
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
  [AppEvents.REMOTE_KV_INITIALIZED]: (kv: RemoteKVWrapper) => void;
  [AppEvents.CHANNEL_MANAGER_LOADED]: () => void;
  [AppEvents.DM_NOTIFICATION_UPDATE]: (event: DMNotificationsUpdateEvent) => void;
}

const channelsEventDecoderMap: { [P in keyof ChannelEventMap]: Decoder<ChannelEventMap[P]> } = {
  [ChannelEvents.MESSAGE_RECEIVED]: messageReceivedEventDecoder,
  [ChannelEvents.NOTIFICATION_UPDATE]: notificationUpdateEventDecoder,
  [ChannelEvents.MESSAGE_DELETED]: messageDeletedEventDecoder,
  [ChannelEvents.USER_MUTED]: userMutedEventDecoder,
  [ChannelEvents.NICKNAME_UPDATE]: nicknameUpdatedEventDecoder,
  [ChannelEvents.CHANNEL_UPDATE]: channelUpdateEventDecoder,
  [ChannelEvents.ADMIN_KEY_UPDATE]: adminKeysUpdateDecoder,
}

export const bus = new EventEmitter() as TypedEventEmitter<EventHandlers>;

export type EventHandler = (eventType: ChannelEvents, data: unknown) => void;

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

export const onDmNotificationUpdate: DmNotificationUpdateCallback['Callback'] = (_filter, changedLevels, deletedLevels) => {
  const event: DMNotificationsUpdateEvent = {
    changedNotificationStates: JSON.parse(decoder.decode(changedLevels)),
    deletedNotificationStates: JSON.parse(decoder.decode(deletedLevels))
  }

  bus.emit(
    AppEvents.DM_NOTIFICATION_UPDATE,
    dmNotificationsUpdateEventDecoder(event)
  )
}

export const handleChannelEvent: EventHandler = (eventType, data) => {
  const eventDecoder = channelsEventDecoderMap[eventType];
  if (!eventDecoder) {
    console.warn('Unhandled event:', eventType, data);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bus.emit(eventType, eventDecoder(data) as any);
  }
}


export const awaitEvent = async <E extends keyof EventHandlers>(evt: E, timeout = 10000): Promise<Parameters<EventHandlers[E]> | undefined> => {
  let listener: EventHandlers[E];
  let resolved = false;
  const promise = new Promise<Parameters<EventHandlers[E]>>((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener = (...args: any) => {
      resolved = true;
      resolve(args);
    };
    bus.addListener(evt, listener);
  });

  return Promise.race([
    promise,
    delay(timeout).then(() => {
      if (!resolved) {
        throw new Error(`Awaiting event ${evt} timed out.`)
      }
      return undefined;
    })
  ]).finally(() => {
    bus.removeListener(evt, listener);
  });
}
