import type { Conversation, DirectMessage, DMState } from './types';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { omit } from 'lodash';

const initialState: DMState = {
  conversationsByPubkey: {},
  messagesByPubkey: {},
  missedMessagesByPubkey: {}
};

export const slice = createSlice({
  initialState,
  name: 'dms',
  reducers: {
    createConversation: (state: DMState, { payload }: PayloadAction<Conversation>) => ({
      ...state,
      conversationsByPubkey: {
        ...state.conversationsByPubkey,
        [payload.pubkey]: payload,
      }
    }),
    notifyNewMessage: (state: DMState, { payload }: PayloadAction<DirectMessage>) => ({
      ...state,
      missedMessagesByPubkey: {
        ...state.missedMessagesByPubkey,
        [payload.pubkey]: true,
      }
    }),
    dismissNewMessages: (state: DMState, { payload: pubkey }: PayloadAction<Conversation['pubkey']>) => ({
      ...state,
      missedMessagesByPubkey: {
        ...state.missedMessagesByPubkey,
        [pubkey]: false,
      }
    }),
    upsertDirectMessage: (state: DMState, { payload: message }: PayloadAction<DirectMessage & { conversationId: string }>) => ({
      ...state,
      messagesByPubkey: {
        [message.conversationId]: {
          ...state.messagesByPubkey[message.conversationId],
          [message.uuid]: {
            ...state.messagesByPubkey[message.conversationId]?.[message.uuid],
            ...omit(message, 'conversationId')
          }
        }
      }
    }),
  }
});

export default slice.reducer;
export * as selectors from './selectors';
export const actions = slice.actions;


