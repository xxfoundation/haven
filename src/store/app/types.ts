import type { ChannelId } from '../channels/types';
import { MessageId } from '../messages/types';

export type AppState = {
  selectedChannelIdOrConversationId: string | null;
  selectedUserPubkey: string | null;
  messageDraftsByChannelId: Record<ChannelId, string>;
  channelsSearch: string;
  contributorsSearch: string;
  channelFavorites: string[];
  lastSeenMessagesByChannelId: Record<ChannelId, MessageId>;
}

declare module 'src/store/types' {
  interface RootState {
    app: AppState;
  }
}