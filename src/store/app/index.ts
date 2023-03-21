import type { AppState } from './types';
import type { ChannelId } from '../channels/types';
import type { ConversationId } from '../dms/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: AppState = {
  selectedChannelId: null,
  selectedConversationId: null,
  selectedUserPubkey: null,
  messageDraftsByChannelId: {},
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
    }),
    updateMessageDraft: (state: AppState, { payload: { channelId, text }}: PayloadAction<{ channelId: ChannelId, text: string }>) => 
    // quill sends a last update before it gets destroyed.
    // If the current channel isnt the one receiving an update then ignore it
    (channelId !== state.selectedChannelId && channelId !== state.selectedConversationId)
      ? state
      : ({
        ...state,
        messageDraftsByChannelId: {
          ...state.messageDraftsByChannelId,
          [channelId]: text
        }
      }),
    clearMessageDraft: (state: AppState, { payload: channelId }: PayloadAction<ChannelId>) => ({
      ...state,
      messageDraftsByChannelId: {
        ...state.messageDraftsByChannelId,
        [channelId]: ''
      }
    })
  }
});

export default slice.reducer;
export * as selectors from './selectors';
export const actions = slice.actions;