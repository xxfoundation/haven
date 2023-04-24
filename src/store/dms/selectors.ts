import type { RootState } from 'src/store/types';
import type { Contributor } from 'src/types';

import { pick, sortBy } from 'lodash';
import { createSelector, Selector } from '@reduxjs/toolkit';

import { Conversation } from './types';
import { identity } from '../identity/selectors';
import { channelFavorites, channelsSearch, currentChannelOrConversationId } from '../app/selectors';

export const dmNickname = (state: RootState) => state.dms.nickname;
export const currentConversation = (state: RootState): Conversation | null => state.dms.conversationsByPubkey[state.app.selectedChannelIdOrConversationId ?? ''] || null;
export const conversations = (state: RootState) => Object.values(state.dms.conversationsByPubkey);
export const allDms = (state: RootState) => state.dms.messagesByPubkey;
export const dmReactions = (state: RootState) => state.dms.reactions;

export const searchFilteredConversations = createSelector(
  conversations,
  channelsSearch,
  channelFavorites,
  (convos, search, favorites) => {
    const sorted = sortBy(convos, (c) => (c.nickname ?? '').concat(c.codename.toLocaleLowerCase()), ['asc']);
    const filtered = sorted.filter((c) =>
      c.codename.toLocaleLowerCase().includes(search.toLocaleLowerCase())
      || c.nickname?.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    )
    
    return sortBy(filtered, (c) => favorites.includes(c.pubkey) ? 0 : 1)
  }
)

export const currentDirectMessages = createSelector(
  currentChannelOrConversationId,
  allDms,
  (conversationId, dms) => {
    if (conversationId === null) {
      return undefined;
    }
    
    return Object.values(dms[conversationId] ?? {});
  }
)

export const currentConversationContributors: Selector<RootState, Contributor[]> = createSelector(
  currentConversation,
  identity,
  (conversation, userIdentity) => conversation && userIdentity ? [
    {
      ...pick(userIdentity, ['pubkey', 'codeset', 'codename']),
      timestamp: '1970-01-01', // doesnt matter here because user is always first
    },
    {
      ...pick(conversation, ['pubkey', 'codeset', 'codename', 'nickname']),
      timestamp: '1970-01-01',  // doesnt matter here because user is always first
    }
  ] as Contributor[] : [],
)

