import type { ChannelId } from '../channels/types';

export type AppState = {
  selectedChannelId: string | null;
  selectedConversationId: string | null;
  selectedUserPubkey: string | null;
  messageDraftsByChannelId: Record<ChannelId, string>;
  channelsSearch: string;
  contributorsSearch: string;
  channelFavorites: string[];
}

declare module 'src/store/types' {
  interface RootState {
    app: AppState;
  }
}