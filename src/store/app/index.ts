import type { AppState } from './types';
import type { ChannelId } from '../channels/types';
import type { ConversationId } from '../dms/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: AppState = {
  selectedChannelId: null,
  selectedConversationId: null,
  selectedUserPubkey: null
};

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    selectChannel: (state: AppState, { payload: channelId }: PayloadAction<ChannelId>) => ({
      ...state,
      selectedChannelId: channelId,
      selectedConversationId: null,
    }),
    selectConversation: (state: AppState, { payload: conversationId }: PayloadAction<ConversationId>) => ({
      ...state,
      selectedConversationId: conversationId,
      selectedChannelId: null,
    }),
    selectUser: (state: AppState, { payload: pubkey }: PayloadAction<string | null>) => ({
      ...state,
      selectedUserPubkey: pubkey
    })
  }
});

export default slice.reducer;
export * as selectors from './selectors';
export const actions = slice.actions;