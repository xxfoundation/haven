import type { RootState } from 'src/store/types';
import type { Contributor, DMNotificationLevel } from 'src/types';

import { mapValues, pick, sortBy } from 'lodash';
import { createSelector, Selector } from '@reduxjs/toolkit';

import { Conversation } from './types';
import { identity } from '../identity/selectors';
import { dmsSearch, currentChannelOrConversationId } from '../app/selectors';
import { byTimestamp } from '../utils';

export const dmNickname = (state: RootState) => state.dms.nickname;
export const currentConversation = (state: RootState): Conversation | null => state.dms.conversationsByPubkey[state.app.selectedChannelIdOrConversationId ?? ''] || null;
export const conversationsByPubkey = (state: RootState) => state.dms.conversationsByPubkey;
export const conversations = createSelector(conversationsByPubkey, (byPubkey) => Object.values(byPubkey));
export const allDms = (state: RootState) => state.dms.messagesByPubkey;
export const dmReactions = (state: RootState) => state.dms.reactions;

export const sortedDmsByPubkey = createSelector(
  allDms,
  (dms) => mapValues(dms, (dmMap) => Object.values(dmMap).sort(byTimestamp))
);

export const searchFilteredConversations = (favorites: string[] = []) => createSelector(
  conversations,
  dmsSearch,
  (convos, search) => {
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
);

export const blockedUsers = (state: RootState) => state.dms.blocked;
export const isBlocked = (pubkey: string) => (state: RootState) => blockedUsers(state).includes(pubkey);
export const notificationLevel = (pubkey?: string | null) => (state: RootState): DMNotificationLevel | undefined => pubkey ? state.dms.notificationLevels[pubkey] : undefined;
export const allNotificationLevels = (state: RootState) => state.dms.notificationLevels;