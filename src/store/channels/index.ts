import type { Channel, ChannelId, ChannelsState } from './types';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { pickBy, omit, uniqBy } from 'lodash';

const initialState: ChannelsState = {
  byId: {},
  sortedChannels: [],
  missedMessages: {},
  currentPages: {},
};

const initialChannelState = {
  hasMissedMessages: false
};

const sortedChannelsReducer = (state: ChannelsState['sortedChannels'], channel: Omit<Channel, 'currentPage' | 'missedMessages'>) => {
  let copy = state.slice();
  copy.push(channel)
  copy = uniqBy(copy, (c) => c.id);
  copy.sort((a, b) => a.name.localeCompare(b.name))
  return copy;
}

export const slice = createSlice({
  initialState,
  name: 'channels',
  reducers: {
    upsert: (state: ChannelsState, { payload }: PayloadAction<Omit<Channel, 'currentPage' | 'missedMessages'>>): ChannelsState => {
      return {
        ...state,
        byId: {
          ...state.byId,
          [payload.id]: {
            ...(state.byId[payload.id] || initialChannelState),
            ...payload,
          }
        },
        sortedChannels: sortedChannelsReducer(state.sortedChannels, payload)
      }
    },
    incrementPage: (state: ChannelsState, { payload }: PayloadAction<ChannelId>): ChannelsState => {
      if (!state.byId[payload]) {
        return state;
      }

      return {
        ...state,
        currentPages: {
          ...state.currentPages,
          [payload]: (state.currentPages[payload] ?? 1) + 1
        }
      }
    },
    delete: (state: ChannelsState, { payload: channelId }: PayloadAction<ChannelId>): ChannelsState => {
      return {
        ...state,
        byId: pickBy(state.byId, ({ id }) => id !== channelId)
      }
    },
    dismissNewMessagesNotification: (state: ChannelsState, { payload: channelId }: PayloadAction<ChannelId>): ChannelsState => {
      return {
        ...state,
        missedMessages: {
          ...state.missedMessages,
          [channelId]: false,
        }
      };
    },
    leaveChannel: (state: ChannelsState, { payload: channelId }: PayloadAction<ChannelId>): ChannelsState => {
      const filtered = omit(state.byId, channelId) as ChannelsState['byId'];

      return {
        ...state,
        byId: filtered,
      }
      
    },
    notifyNewMessage: (state: ChannelsState, { payload: channelId }: PayloadAction<ChannelId>): ChannelsState => {
      return !state.byId[channelId] ? state : ({
        ...state,
        missedMessages: {
          ...state.missedMessages,
          [channelId]: true
        }
      });
    },
    upgradeAdmin: (state: ChannelsState, { payload: channelId }: PayloadAction<ChannelId>) => {
      return ({
        ...state,
        byId: {
          ...state.byId,
          [channelId]: {
            ...state.byId[channelId],
            isAdmin: true
          }
        }
      })
    },
  }
});

export default slice.reducer;

export const actions = slice.actions;
export * as selectors from './selectors';


