import type { RootState } from 'src/store/types';
import type { Contributor } from 'src/types';

import { pick } from 'lodash';
import { createSelector, Selector } from '@reduxjs/toolkit';

import { Conversation } from './types';
import { identity } from '../identity/selectors';
import { currentConversationId } from '../app/selectors';

export const dmNickname = (state: RootState) => state.dms.nickname;
export const currentConversation = (state: RootState): Conversation | null => state.dms.conversationsByPubkey[state.app.selectedConversationId ?? ''] || null;
export const conversations = (state: RootState) => Object.values(state.dms.conversationsByPubkey);
export const allDms = (state: RootState) => state.dms.messagesByPubkey;
export const dmReactions = (state: RootState) => state.dms.reactions;

export const currentDirectMessages = createSelector(
  currentConversationId,
  allDms,
  (conversationId, dms) => {
    if (conversationId === null) {
      return undefined;
    }
    
    return Object.values(dms[conversationId] ?? {});
  }
)

export const newDmsNotifications = (state: RootState) => Object.keys(state.dms.conversationsByPubkey).reduce((notifications, pubkey) => ({
  ...notifications,
  [pubkey]: state.dms.missedMessagesByPubkey[pubkey] || false,
}), {} as Record<string, boolean>);

export const currentConversationContributors: Selector<RootState, Contributor[]> = createSelector(
  currentConversation,
  identity,
  (conversation, userIdentity) => conversation ? [
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

