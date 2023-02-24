import type { Message, MessagesState } from './types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { omit } from 'lodash';

const initialState: MessagesState = { byId: {} };

const upsert = (state: MessagesState, message: Message) => ({
  ...state,
  byId: {
    ...state.byId,
    [message.uuid]: {
      ...state.byId[message.uuid],
      ...message
    },
  }
});

export const slice = createSlice({
  initialState,
  name: 'messages',
  reducers: {
    upsert: (state: MessagesState, { payload }: PayloadAction<Message>) => upsert(state, payload),
    upsertMany: (state: MessagesState, { payload: messages }: PayloadAction<Message[]>) =>
      messages.reduce(upsert, state),
    delete: (state: MessagesState, { payload: messageId }: PayloadAction<Message['id']>): MessagesState => {
      const found = Object.values(state.byId).find((message) => message.id === messageId);
      return {
        ...state,
        byId: found ? omit(state.byId, found.uuid) : state.byId
      }
    }
  }
});

export default slice.reducer;
export const { actions } = slice;
export * as selectors from './selectors';



