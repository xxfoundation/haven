
import type { RootState } from 'src/store/types';
import type { Contributor, Message } from './types';

import { flatten, sortBy, uniqBy } from 'lodash';
import { createSelector } from '@reduxjs/toolkit';

import { currentDirectMessages, dmReactions, currentConversationContributors } from '../dms/selectors';

import { contributorsSearch, currentChannelOrConversationId } from '../app/selectors';

export const reactions = (state: RootState) => state.messages.reactions;
export const contributors = (state: RootState) => state.messages.contributorsByChannelId;

export const currentChannelMessages = (state: RootState) => {
  if (state.app.selectedChannelIdOrConversationId === null) {
    return undefined;
  }

  return state.messages.sortedMessagesByChannelId[state.app.selectedChannelIdOrConversationId];
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
  currentChannelMessages,
  currentDirectMessages,
  (msgs, dms) => {
    return message.repliedTo && (
     msgs?.find((msg) => msg.id === message.repliedTo)
     || dms?.find((msg) => msg.id === message.repliedTo)
    );
  }
)
  
export const currentPinnedMessages = (state: RootState) => currentChannelMessages(state)?.filter((msg) => msg.pinned);

export const currentChannelContributors = createSelector(
  currentChannelOrConversationId,
  contributors,
  (channelId, allContributors) => channelId !== null && allContributors[channelId] ? allContributors[channelId] : []
);

export const messageableContributors = createSelector(
  contributors,
  (mapped) => {
    const flattened = flatten(Object.values(mapped))
    .filter((c) => c.dmToken !== undefined);

    return sortBy(uniqBy(flattened, (c) => c.pubkey), (c) => `${c.nickname?.toLocaleLowerCase() ?? ''}${c.codename.toLocaleLowerCase()}`);
  }
);

export const currentContributors: (root: RootState) => Contributor[] = createSelector(
  currentChannelContributors,
  currentConversationContributors,
  contributorsSearch,
  (channelContributors, conversationContributors, search) => {
    return channelContributors
      .concat(conversationContributors)
      .filter((c) =>
        c.codename.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        || c.nickname?.toLocaleLowerCase().includes(search.toLocaleLowerCase())
      )
  }
);
 