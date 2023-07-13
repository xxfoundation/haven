
import type { AppState } from './types';
import type { ChannelId } from '../channels/types';
import type { ConversationId } from '../dms/types';
import type { Message } from '../messages/types';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MessageType } from '@types';

const initialState: AppState = {
  selectedChannelIdOrConversationId: null,
  selectedUserPubkey: null,
  messageDraftsByChannelId: {},
  channelsSearch: '',
  dmsSearch: '',
  contributorsSearch: '',
  channelFavorites: [],
  missedMessages: {},
};

type LastSeenMessagePayload = Message

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    notifyNewMessage: (state: AppState, { payload: message }: PayloadAction<LastSeenMessagePayload>) => {
      const missedMessages = state.missedMessages?.[message.channelId];

      if (message?.type === MessageType.Reaction || missedMessages?.includes(message.id)) {
        return state;
      }

      return {
        ...state,
        missedMessages: {
          ...state.missedMessages,
          [message.channelId]: (state.missedMessages?.[message.channelId] || []).concat(message.id),
        }
      }
    },
    dismissNewMessages: (state: AppState, { payload: channelId }: PayloadAction<ChannelId | ConversationId>) => ({
      ...state,
      missedMessages: {
        ...state.missedMessages,
        [channelId]: undefined,
      }
    }),
    toggleFavorite: (state: AppState, { payload: channelId }: PayloadAction<ChannelId>) => ({
      ...state,
      channelFavorites: state.channelFavorites.includes(channelId)
        ? state.channelFavorites.filter((f) => f !== channelId)
        : state.channelFavorites.concat(channelId)
    }),
    updateContributorsSearch: (state: AppState, { payload: contributorsSearch }: PayloadAction<string>) => ({
      ...state,
      contributorsSearch,
    }),
    updateChannelsSearch: (state: AppState, { payload: channelsSearch }: PayloadAction<string>) => ({
      ...state,
      channelsSearch
    }),
    updateDmsSearch: (state: AppState, { payload: dmsSearch }: PayloadAction<string>) => ({
      ...state,
      dmsSearch
    }),
    selectChannelOrConversation: (state: AppState, { payload: channelId }: PayloadAction<ChannelId | ConversationId>) => {
      return {
        ...state,
        selectedChannelIdOrConversationId: channelId,
      }
    },
    selectUser: (state: AppState, { payload: pubkey }: PayloadAction<string | null>) => ({
      ...state,
      selectedUserPubkey: pubkey
    }),
    updateMessageDraft: (state: AppState, { payload: { channelId, text }}: PayloadAction<{ channelId: ChannelId, text: string }>) => 
    // quill sends a last update before it gets destroyed.
    // If the current channel isnt the one receiving an update then ignore it
    (channelId !== state.selectedChannelIdOrConversationId && channelId !== state.selectedChannelIdOrConversationId)
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