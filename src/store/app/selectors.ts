import type { RootState } from 'src/store/types';

export const currentChannelId = (state: RootState) => state.app.selectedChannelId;
export const currentConversationId = (state: RootState) => state.app.selectedConversationId;
export const currentDrawerUserPubkey = (state: RootState) => state.app.selectedUserPubkey;