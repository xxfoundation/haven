import type { Channel, ChannelId, ChannelsState } from './types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { pickBy } from 'lodash';

const initialState: ChannelsState = {
  byId: {},
};

export const slice = createSlice({
  initialState,
  name: 'channels',
  reducers: {
    select: (state: ChannelsState, action: PayloadAction<ChannelId>): ChannelsState => ({
      ...state,
      currentChannel: state.byId[action.payload] && action.payload
    }),
    add: (state: ChannelsState, action: PayloadAction<Channel>): ChannelsState => ({
      ...state,
      byId: {
        [action.payload.id]: action.payload,
        ...state.byId
      }
    }),
    delete: (state: ChannelsState, action: PayloadAction<ChannelId>): ChannelsState => {
      return {
        ...state,
        byId: {
          ...pickBy(state.byId, ({ id }) => id !== action.payload)
        }
      }
    }
  }
});

export default slice.reducer;
