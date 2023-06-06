import type { Conversation, DMState } from './types';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '../messages/types';

import { reactionsReducer } from '../utils';
import { MessageType } from '@types';
import { uniq } from 'lodash';

const initialState: DMState = {
  conversationsByPubkey: {},
  messagesByPubkey: {},
  reactions: {},
  blocked: [],
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

const upsertMessage = (state: DMState, message: Message) => ({
  ...state,
  reactions: reactionsReducer(state.reactions, message),
  ...(message.type !== MessageType.Reaction && {
      messagesByPubkey: {
      ...state.messagesByPubkey,
      [message.channelId]: {
        ...state.messagesByPubkey[message.channelId],
        [message.uuid]: {
          ...state.messagesByPubkey[message.channelId]?.[message.uuid],
          ...message
        }
      }
    }
  })
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
    upsertDirectMessage: (state: DMState, { payload: message }: PayloadAction<Message>) => 
      upsertMessage(state, message),
    upsertManyDirectMessages: (
      state: DMState,
      { payload: messages }: PayloadAction<Message[]>
    ) => messages.reduce(upsertMessage, state),
    setUserNickname: (state: DMState, { payload: nickname }: PayloadAction<string>) => ({
      ...state,
      nickname
    }),
    blockUser: (state: DMState, { payload: pubkey }: PayloadAction<string>) => ({
      ...state,
      blocked: uniq(state.blocked.concat(pubkey))
    }),
    unblockUser: (state: DMState, { payload: pubkey }: PayloadAction<string>) => ({
      ...state,
      blocked: state.blocked.filter((b) => b !== pubkey)
    }),
  }
});

export default slice.reducer;
export * as selectors from './selectors';
export const actions = slice.actions;


