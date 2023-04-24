import type { ChannelId } from '../channels/types';
import { ConversationId } from '../dms/types';
import { Message } from '../messages/types';

export type AppState = {
  selectedChannelIdOrConversationId: string | null;
  selectedUserPubkey: string | null;
  messageDraftsByChannelId: Record<ChannelId, string>;
  channelsSearch: string;
  contributorsSearch: string;
  channelFavorites: string[];
  oldestMissedMessageByChannelId?: Record<ChannelId | ConversationId, Message>;
}

declare module 'src/store/types' {
  interface RootState {
    app: AppState;
  }
}