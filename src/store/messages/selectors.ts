
import type { RootState } from 'src/store/types';
import type { Message } from './types';

import { createSelector } from '@reduxjs/toolkit';

import { allDms, dmReactions, currentConversationContributors } from '../dms/selectors';

import { byTimestamp } from '../utils';
import { currentChannelId } from '../app/selectors';

export const allMessages = (state: RootState) => state.messages.byChannelId;
export const reactions = (state: RootState) => state.messages.reactions;
export const contributors = (state: RootState) => state.messages.contributorsByChannelId;

export const currentChannelMessages = (state: RootState) => {
  if (state.app.selectedChannelId === null) {
    return undefined;
  }

  return Object.values(state.messages.byChannelId[state.app.selectedChannelId] ?? {})
    .sort(byTimestamp);
}

export const reactionsTo = (message: Message) =>
  createSelector(
    reactions,
    dmReactions,
    (allReactions, allDmReactions) => {
      const channReactions = allReactions?.[message.id];
      const dmReacts = allDmReactions?.[message.id];
      return Object.entries(channReactions ?? dmReacts ?? {}).sort((a, b) => b[1].length - a[1].length)
    }
  );

export const repliedTo = (message: Message) => createSelector(
  allMessages,
  allDms,
  (msgs, dms) => {
    return message.repliedTo && (
     msgs[message.channelId]?.[message.uuid]
     || dms[message.channelId]?.[message.uuid]
    );
  }
)
  
export const currentPinnedMessages = (state: RootState) => currentChannelMessages(state)?.filter((msg) => msg.pinned);

export const currentChannelContributors = createSelector(
  currentChannelId,
  contributors,
  (channelId, allContributors) => channelId !== null && allContributors[channelId] ? allContributors[channelId] : []
);


export const currentContributors: (root: RootState) => Pick<Message, 'pubkey' | 'codeset' | 'codename' | 'nickname'>[] = createSelector(
  currentChannelContributors,
  currentConversationContributors,
  (channelContributors, conversationContributors) =>  channelContributors.concat(conversationContributors)
);
 