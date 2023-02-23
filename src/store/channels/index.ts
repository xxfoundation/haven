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
    upsert: (state: ChannelsState, { payload }: PayloadAction<Omit<Channel, 'currentPage' | 'missedMessages'>>): ChannelsState => {
      return {
        ...state,
        byId: {
          ...state.byId,
          [payload.id]: {
            ...(state.byId[payload.id] || initialChannelState),
            ...payload,
          }
        }
      }
    },
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
        byId: pickBy(state.byId, ({ id }) => id !== channelId)
      }
    },
    dismissNewMessagesNotification: (state: ChannelsState, { payload: channelId }: PayloadAction<ChannelId>): ChannelsState => {
      return {
        ...state,
        byId: {
          ...state.byId,
          [channelId]: {
            ...state.byId[channelId],
            hasMissedMessages: false,
          }
        },
      };
    },
    leaveChannel: (state: ChannelsState, { payload: channelId }: PayloadAction<ChannelId>): ChannelsState => {
      const filtered = omit(state.byId, channelId) as ChannelsState['byId'];

      return {
        ...state,
        byId: filtered,
      }
      
    },
    notifyNewMessage: (state: ChannelsState, action: PayloadAction<ChannelId>): ChannelsState => {
      return !state.byId[action.payload] ? state : ({
        ...state,
        byId: {
          ...state.byId,
          [action.payload]: {
            ...state.byId[action.payload],
            hasMissedMessages: true,
          }
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


