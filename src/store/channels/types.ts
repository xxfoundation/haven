import { NotificationLevel } from 'src/types';

export enum PrivacyLevel {
  Public = 0,
  Private = 1,
  Secret = 2
}

export type Channel = {
  name: string;
  id: string;
  description: string;
  isAdmin: boolean;
  privacyLevel: PrivacyLevel | null;
  prettyPrint?: string;
}

export type ChannelId = Channel['id'];

export type ChannelsState = {
  byId: Record<ChannelId, Channel>;
  sortedChannels: Array<Channel>;
  currentPages: Record<ChannelId, number>;
  nicknames: Record<ChannelId, string | undefined>;
  mutedUsersByChannelId: Record<ChannelId, string[]>;
  notificationLevels: Record<ChannelId, NotificationLevel | undefined>;
};

declare module 'src/store/types' {
  interface RootState {
    channels: ChannelsState;
  }
}