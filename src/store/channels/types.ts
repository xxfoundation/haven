export enum PrivacyLevel {
  Public = 0,
  Private = 1,
  Secret = 2
}

export type ChannelInfo = {
  name: string;
  id: string;
  description: string;
  isAdmin: boolean;
  privacyLevel: PrivacyLevel | null;
  prettyPrint?: string;
}

export type Channel = ChannelInfo & {
  currentPage: number;
  hasMissedMessages?: boolean;
}

export type ChannelId = Channel['id'];

export type ChannelsState = {
  byId: Record<ChannelId, Channel>;
};

declare module 'src/store/types' {
  interface RootState {
    channels: ChannelsState;
  }
}