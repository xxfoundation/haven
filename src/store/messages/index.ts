import type { Message, MessagesState } from './types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { omit } from 'lodash';

import * as events from 'src/events';

const initialState: MessagesState = { byId: {} };

const upsert = (state: MessagesState, message: Message) => {
  const previousMessageState = state.byId[message.uuid];
  const lastTimestamp: number | undefined = previousMessageState
    && new Date(state.byId[message.uuid]?.timestamp).getTime();
  const currentTimestamp = new Date(message.timestamp).getTime();

  if (lastTimestamp && lastTimestamp > currentTimestamp) {
    return state;
  }

  if (previousMessageState && previousMessageState && message.pinned === true) {
    events.bus.emit(events.MESSAGE_PINNED, message);
  }

  return {
    ...state,
    byId: {
      [message.uuid]: message,
      ...state.byId
    }
  }
};

export const slice = createSlice({
  initialState,
  name: 'messages',
  reducers: {
    upsert: (state: MessagesState, { payload }: PayloadAction<Message>) => upsert(state, payload),
    upsertMany: (state: MessagesState, { payload: messages }: PayloadAction<Message[]>) =>
      messages.reduce(upsert, state),
    delete: (state: MessagesState, { payload: messageId }: PayloadAction<Message['id']>): MessagesState => ({
      ...state,
      byId: omit(state.byId, messageId)
    })
  }
});

export default slice.reducer;
export const { actions } = slice;
export * as selectors from './selectors';



