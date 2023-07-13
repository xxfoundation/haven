import type { ChannelId } from '../channels/types';
import { ConversationId } from '../dms/types';
import { MessageId } from '../messages/types';

export type AppState = {
  selectedChannelIdOrConversationId: string | null;
  selectedUserPubkey: string | null;
  messageDraftsByChannelId: Record<ChannelId, string>;
  channelsSearch: string;
  dmsSearch?: string;
  contributorsSearch: string;
  channelFavorites: string[];
  missedMessages?: Record<ChannelId | ConversationId, MessageId[] | undefined>;
}

declare module 'src/store/types' {
  interface RootState {
    app: AppState;
  }
}