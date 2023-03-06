import type { EmojiReactions, RootState } from 'src/store/types';
import type { Message } from 'src/types';

import { uniqBy } from 'lodash';
import assert from 'assert';
import { createSelector } from '@reduxjs/toolkit';

import { MessageType } from 'src/types';
import { byTimestamp } from '../utils';
import { Conversation } from './types';
import { identity } from '../identity/selectors';

export const dmNickname = (state: RootState) => state.dms.nickname;
export const currentConversation = (state: RootState): Conversation | null => state.dms.conversationsByPubkey[state.app.selectedConversationId ?? ''] || null;
export const conversations = (state: RootState) => Object.values(state.dms.conversationsByPubkey);
const allCurrentMessages = (state: RootState) => Object.values(state.dms.messagesByPubkey[state.app.selectedConversationId ?? ''] ?? {});

export const currentDirectMessages = createSelector(
  currentConversation,
  allCurrentMessages,
  identity,
  dmNickname,
  (conversation, allMessages, userIdentity, nickname) => {
    if (!conversation) {
      return undefined;
    }
  
    return allMessages.sort(byTimestamp)
      .filter((msg) =>
        [MessageType.Normal, MessageType.Reply].includes(msg.type)
        && conversation.pubkey === msg.conversationId
      ).map((msg): Message => ({
        nickname: msg.pubkey === userIdentity?.pubkey ? nickname : conversation.nickname,
        id: msg.messageId,
        uuid: msg.uuid,
        repliedTo: msg.parentMessageId,
        codename: msg.codename,
        type: msg.type,
        channelId: msg.pubkey,
        status: msg.status,
        round: msg.round,
        body: msg.body,
        timestamp: msg.timestamp,
        pinned: false,
        hidden: false,
        pubkey: msg.pubkey,
        codeset: msg.codeset
      }));
  }
)

export const currentDmReactions =
  createSelector(
    allCurrentMessages,
     (messages) => {
      const reactions = messages.filter((msg) => msg.type === MessageType.Reaction);
      return reactions
        .filter((m) => typeof m.parentMessageId === 'string')
        .reduce((map, { body: emoji, codeset, parentMessageId, pubkey }) => {
          assert(typeof parentMessageId === 'string');
          return {
            ...map,
            [parentMessageId]: {
              ...map[parentMessageId],
              [emoji]: uniqBy(map[parentMessageId]?.[emoji]?.concat({ codeset, pubkey }) ?? [{ codeset, pubkey }], (i) => i.pubkey),
            }
          };
        }, {} as EmojiReactions);
    }
  );

export const newDmsNotifications = (state: RootState) => Object.keys(state.dms.conversationsByPubkey).reduce((notifications, pubkey) => ({
  ...notifications,
  [pubkey]: state.dms.missedMessagesByPubkey[pubkey] || false,
}), {} as Record<string, boolean>);

