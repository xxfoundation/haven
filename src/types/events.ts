/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ChannelId } from 'src/store/channels/types';
import type { Message } from 'src/store/messages/types';
import { MessageType } from './db';

export type MessageReceivedEvent = {
  uuid: number;
  channelId: string;
  update: boolean;
}

export type MessagePinEvent = Message;

export type MessageUnPinEvent = Message;

export type MessageDeletedEvent = {
  messageId: string;
}

export type UserMutedEvent = {
  channelId: string;
  pubkey: string;
  unmute: boolean;
}

export type DMReceivedEvent = {
  messageUuid: string;
  pubkey: Uint8Array;
  update: boolean;
  conversationUpdated: boolean;
}

export type NicknameUpdatedEvent = {
  channelId: string;
  nickname: string;
  exists: boolean;
}

export type AdminKeysUpdateEvent = {
  channelId: string;
}

export enum ChannelStatus {
  SYNC_CREATED = 0,
  SYNC_UPDATED = 1,
  SYNC_DELETED = 2,
  SYNC_LOADED = 3
}

export type ChannelUpdateEvent = {
  channelId: string;
  status: ChannelStatus;
  tokenEnabled: boolean;
};

export type AllowList = Partial<Record<MessageType, Record<string, unknown>>>;

export type AllowLists = {
  allowWithTags: AllowList;
  allowWithoutTags: AllowList;
}

export enum NotificationLevel {
  NotifyNone = 10,
  NotifyPing = 20,
  NotifyAll = 40
}

export enum NotificationStatus {
  Mute = 0,
  WhenOpen = 1,
  Push = 2
}

export type NotificationState = {
  channelId: string;
  level: NotificationLevel;
  status: NotificationStatus;
}

export type NotificationUpdateEvent = {
  changedNotificationStates: NotificationState[];
  deletedNotificationStates: ChannelId[] | null;
  maxState: number;
}

export type DMNotificationLevelState = {
  pubkey: string;
  level: NotificationLevel
}

export type DMNotificationsUpdateEvent = {
  changedNotificationStates: DMNotificationLevelState[];
  deletedNotificationStates: string[];
}