import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Conversation, DMState } from './types';

const initialState: DMState = {
  conversationsByPubkey: {},
  messagesByPubkey: {},
  selectedConversationPubkey: null,
};

export const slice = createSlice({
  initialState,
  name: 'dms',
  reducers: {
    createConversation: (state: DMState, { payload }: PayloadAction<Conversation>) => ({
      ...state,
      [payload.token]: payload,
    }),
    selectConversation: (state: DMState, { payload }: PayloadAction<DMState['selectedConversationPubkey']>) => ({
      ...state,
      selectedConversationPubkey: payload
    })
  }
});

export default slice.reducer;

export const actions = slice.actions;


