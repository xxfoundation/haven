import type { AppState } from './types';
import type { ChannelId } from '../channels/types';
import type { ConversationId } from '../dms/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MessageId } from '../messages/types';

const initialState: AppState = {
  selectedChannelIdOrConversationId: null,
  selectedUserPubkey: null,
  messageDraftsByChannelId: {},
  channelsSearch: '',
  contributorsSearch: '',
  channelFavorites: [],
  lastSeenMessagesByChannelId: {}
};

type LastSeenMessagePayload = {
  channelId: ChannelId;
  messageId: MessageId;
}

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    updateLastSeenMessage: (state: AppState, { payload }: PayloadAction<LastSeenMessagePayload>) => ({
      ...state,
      lastSeenMessagesByChannelId: {
        ...state.lastSeenMessagesByChannelId,
        [payload.channelId]: payload.messageId
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
    selectChannel: (state: AppState, { payload: channelId }: PayloadAction<ChannelId>) => ({
      ...state,
      selectedChannelIdOrConversationId: channelId,
    }),
    selectConversation: (state: AppState, { payload: conversationId }: PayloadAction<ConversationId>) => ({
      ...state,
      selectedChannelIdOrConversationId: conversationId,
    }),
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