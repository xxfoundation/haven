import type { Message, MessagesState } from './types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { omit } from 'lodash';

const initialState: MessagesState = { byChannelId: {} };

const upsert = (state: MessagesState, message: Message) => ({
  ...state,
  byChannelId: {
    ...state.byChannelId,
    [message.channelId]: {
      ...state.byChannelId[message.channelId],
      [message.uuid]: {
        ...state.byChannelId[message.channelId]?.[message.uuid],
        ...message
      }
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
      let found: Message | undefined;
      Object.values(state.byChannelId)
        .some((channelMessages) => {
          found = Object.values(channelMessages).find((msg) => msg.id === messageId)
          return !!found;
        });
      
      return !found ? state : {
        ...state,
        byChannelId: {
          ...state.byChannelId,
          [found.channelId]: omit(state.byChannelId[found.channelId], found.uuid),
        }
      }
    }
  }
});

export default slice.reducer;
export const { actions } = slice;
export * as selectors from './selectors';



