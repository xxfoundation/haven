import type { Contributor, Message, MessagesState } from './types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { pick, omit } from 'lodash';
import { byTimestamp, deleteReactionReducer, reactionsReducer } from '../utils';
import { MessageId, MessageType } from '@types';

const initialState: MessagesState = {
  reactions: {},
  contributorsByChannelId: {},
  byChannelId: {}
};

const contributorMapper = (message: Message): Contributor => pick(message, ['nickname', 'timestamp', 'pubkey', 'codeset', 'codename'])

const contributorsReducer = (state: MessagesState['contributorsByChannelId'], msg: Message) => {
  const currentContributors = state[msg.channelId]?.slice() ?? [];
  const index = currentContributors.findIndex((c) => c.pubkey === msg.pubkey);
  
  if (index !== -1) {
    const foundContributor = currentContributors[index];

    if (new Date(foundContributor.timestamp).getTime() < new Date(msg.timestamp).getTime()) {
      currentContributors.splice(index, 1, contributorMapper(msg));
    }
  } else {
    currentContributors.push(contributorMapper(msg));
  }

  currentContributors.sort(byTimestamp).reverse();
  return {
    ...state,
    [msg.channelId]: currentContributors,
  }
}

const upsert = (state: MessagesState, message: Message) => ({
  ...state,
  contributorsByChannelId: contributorsReducer(state.contributorsByChannelId, message),
  reactions: reactionsReducer(state.reactions, message),
  ...(message.type !== MessageType.Reaction && !message.hidden && {
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
  })
});

export const slice = createSlice({
  initialState,
  name: 'messages',
  reducers: {
    upsert: (state: MessagesState, { payload }: PayloadAction<Message>) => upsert(state, payload),
    upsertMany: (state: MessagesState, { payload: messages }: PayloadAction<Message[]>) =>
      messages.reduce(upsert, state),
    delete: (state: MessagesState, { payload: messageId }: PayloadAction<MessageId>): MessagesState => {
      let found: Message | undefined;
      Object.values(state.byChannelId)
        .some((channelMessages) => {
          found = Object.values(channelMessages).find((msg) => msg.id === messageId)
          return !!found;
        });
      
      return {
        ...state,
        reactions: deleteReactionReducer(state.reactions, messageId),
        ...(found && {
          byChannelId: {
            ...state.byChannelId,
            [found.channelId]: omit(state.byChannelId[found.channelId], found.uuid),
          }
        })
      }
    }
  }
});

export default slice.reducer;
export const { actions } = slice;
export * as selectors from './selectors';



