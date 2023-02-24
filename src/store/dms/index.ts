import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Conversation, DMState } from './types';

const initialState: DMState = {
  conversationsByPubkey: {},
  messagesByPubkey: {},
};

export const slice = createSlice({
  initialState,
  name: 'dms',
  reducers: {
    createConversation: (state: DMState, { payload }: PayloadAction<Conversation>) => ({
      ...state,
      [payload.token]: payload,
    }),
  }
});

export default slice.reducer;
export * as selectors from './selectors';
export const actions = slice.actions;


