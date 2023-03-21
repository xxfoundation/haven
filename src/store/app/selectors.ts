import type { RootState } from 'src/store/types';
import type { ChannelId } from '../channels/types';

export const currentChannelId = (state: RootState) => state.app.selectedChannelId;
export const currentConversationId = (state: RootState) => state.app.selectedConversationId;
export const currentDrawerUserPubkey = (state: RootState) => state.app.selectedUserPubkey;
export const messageDraft = (channelId?: ChannelId) => (state: RootState) => (channelId && state.app.messageDraftsByChannelId[channelId]) ?? '';