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

export type DmTokenUpdateEvent = {
  channelId: string;
  tokenEnabled: boolean;
}

export type AllowList = Partial<Record<MessageType, Record<string, unknown>>>;

export type AllowLists = {
  allowWithTags: AllowList;
  allowWithoutTags: AllowList;
}

export type NotificationFilter = {
  id: string;
  channelId: string;
  tags: string[];
  allowLists: AllowLists;
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
  notificationFilters: NotificationFilter[];
  changedNotificationStates: NotificationState[];
  deletedNotificationStates: ChannelId[];
  maxState: number;
}