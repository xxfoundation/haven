import type { Channel, ChannelId, ChannelsState } from './types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { pickBy, omit } from 'lodash';

const initialState: ChannelsState = {
  byId: {},
};

const initialChannelState = {
  currentPage: 1,
  hasMissedMessages: false
};

export const slice = createSlice({
  initialState,
  name: 'channels',
  reducers: {
    upsert: (state: ChannelsState, { payload }: PayloadAction<Omit<Channel, 'currentPage' | 'missedMessages'>>): ChannelsState => ({
      ...state,
      byId: {
        ...state.byId,
        [payload.id]: {
          ...(state.byId[payload.id] || initialChannelState),
          ...payload,
        }
      }
    }),
    incrementPage: (state: ChannelsState, { payload }: PayloadAction<ChannelId>): ChannelsState => {
      if (!state.byId[payload]) {
        return state;
      }

      return {
        ...state,
        byId: {
          ...state.byId,
          [payload]: {
            ...state.byId[payload],
            currentPage: state.byId[payload].currentPage + 1
          }
        }
      }
    },
    delete: (state: ChannelsState, { payload: channelId }: PayloadAction<ChannelId>): ChannelsState => {
      return {
        ...state,
        byId: {
          ...pickBy(state.byId, ({ id }) => id !== channelId)
        }
      }
    },
    select: (state: ChannelsState, { payload: channelId }: PayloadAction<ChannelId>): ChannelsState => ({
      ...state,
      byId: {
        ...state.byId,
        [channelId]: state.byId[channelId] && {
          ...state.byId[channelId],
          hasMissedMessages: false,
        }
      },
      currentChannelId: state.byId[channelId] && channelId
    }),
    leaveCurrentChannel: (state: ChannelsState): ChannelsState => {
      if (state.currentChannelId === undefined) {
        return state;
      }
      const filtered = omit(state.byId, state.currentChannelId) as ChannelsState['byId'];

      return {
        ...state,
        byId: filtered,
        currentChannelId: Object.values(filtered)[0]?.id,
      }
      
    },
    notifyNewMessage: (state: ChannelsState, action: PayloadAction<ChannelId>): ChannelsState => action.payload === state.currentChannelId ? state : ({
      ...state,
      byId: {
        ...state.byId,
        [action.payload]: state.byId[action.payload] && {
          ...state.byId[action.payload],
          hasMissedMessages: false,
        }
      }
    }),
    upgradeAdminInCurrentChannel: (state: ChannelsState) => state.currentChannelId ? ({
      ...state,
      byId: {
        ...state.byId,
        [state.currentChannelId]: {
          ...state.byId[state.currentChannelId],
          isAdmin: true
        }
      }
    }) : state,
  }
});

export default slice.reducer;

export const actions = slice.actions;
export * as selectors from './selectors';


