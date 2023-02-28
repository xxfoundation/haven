import type { Conversation, DirectMessage, DMState } from './types';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: DMState = {
  conversationsByPubkey: {},
  messagesByPubkey: {},
  missedMessagesByPubkey: {}
};

const upsertConversation = (state: DMState, conversation: Conversation) => ({
  ...state,
  conversationsByPubkey: {
    ...state.conversationsByPubkey,
    [conversation.pubkey]: {
      ...state.conversationsByPubkey[conversation.pubkey],
      ...conversation,
    }
  }
});

const upsertMessage = (state: DMState, message: DirectMessage) => ({
  ...state,
  messagesByPubkey: {
    [message.conversationId]: {
      ...state.messagesByPubkey[message.conversationId],
      [message.uuid]: {
        ...state.messagesByPubkey[message.conversationId]?.[message.uuid],
        ...message
      }
    }
  }
});

export const slice = createSlice({
  initialState,
  name: 'dms',
  reducers: {
    upsertConversation: (
      state: DMState,
      { payload: conversation }: PayloadAction<Conversation>
    ) => upsertConversation(state, conversation),
    upsertManyConversations: (
      state: DMState,
      { payload: conversations }: PayloadAction<Conversation[]>
    ) => conversations.reduce(upsertConversation,state),
    notifyNewMessage: (state: DMState, { payload: pubkey }: PayloadAction<Conversation['pubkey']>) => ({
      ...state,
      missedMessagesByPubkey: {
        ...state.missedMessagesByPubkey,
        [pubkey]: true,
      }
    }),
    dismissNewMessages: (state: DMState, { payload: pubkey }: PayloadAction<Conversation['pubkey']>) => ({
      ...state,
      missedMessagesByPubkey: {
        ...state.missedMessagesByPubkey,
        [pubkey]: false,
      }
    }),
    upsertDirectMessage: (state: DMState, { payload: message }: PayloadAction<DirectMessage>) => 
      upsertMessage(state, message),
    upsertManyDirectMessages: (
      state: DMState,
      { payload: messages }: PayloadAction<DirectMessage[]>
    ) => messages.reduce(upsertMessage, state)
  }
});

export default slice.reducer;
export * as selectors from './selectors';
export const actions = slice.actions;


