export enum PrivacyLevel {
  Public = 0,
  Private = 1,
  Secret = 2
}

export interface Channel {
  prettyPrint?: string;
  name: string;
  id: string;
  description: string;
  isAdmin: boolean;
  privacyLevel: PrivacyLevel | null;
  isLoading?: boolean;
  withMissedMessages?: boolean;
  currentMessagesBatch?: number;
}

export type ChannelId = Channel['id'];

export type ChannelsState = {
  byId: Record<ChannelId, Channel>;
  currentChannel?: ChannelId;
};

declare module 'src/store/types' {
  interface RootState {
    channels: ChannelsState;
  }
}