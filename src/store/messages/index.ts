import type { Message,MessagesState } from './types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { pickBy } from 'lodash';

const initialState: MessagesState = { byId: {} };

export const slice = createSlice({
  initialState,
  name: 'messages',
  reducers: {
    upsert: (state: MessagesState, action: PayloadAction<Message>): MessagesState => {
      return {
        ...state,
        byId: {
          [action.payload.uuid]: action.payload,
          ...state.byId
        }
      }
    },
    deleteById: (state: MessagesState, action: PayloadAction<Message['id']>): MessagesState => {
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



