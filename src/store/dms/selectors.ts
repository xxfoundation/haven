import type { EmojiReactions, RootState } from 'src/store/types';
import type { Message } from 'src/types';

import { uniqBy } from 'lodash';

import {  MessageType } from 'src/types';
import { byTimestamp } from '../utils';
import { Conversation } from './types';

export const currentConversation = (state: RootState): Conversation | null => state.dms.conversationsByPubkey[state.app.selectedConversationId ?? ''] || null;
export const conversations = (state: RootState) => Object.values(state.dms.conversationsByPubkey);
const allCurrentMessages = (state: RootState) => Object.values(state.dms.messagesByPubkey[state.app.selectedConversationId ?? ''] ?? {});
export const currentDirectMessages = (state: RootState) => {
  const conversation = currentConversation(state);

  if (!conversation) {
    return undefined;
  }

  return allCurrentMessages(state)
    .sort(byTimestamp)
    .filter((msg) =>
      [MessageType.Normal, MessageType.Reply].includes(msg.type)
      && state.app.selectedConversationId === msg.pubkey
    ).map((msg): Message => ({
      id: msg.messageId,
      uuid: msg.uuid,
      repliedTo: msg.parentMessageId,
      codename: conversation.codename,
      type: msg.type,
      channelId: conversation.pubkey,
      round: msg.round,
      body: msg.body,
      timestamp: msg.timestamp,
      pinned: false,
      hidden: false,
      pubkey: msg.pubkey,
      codeset: conversation.codeset
    }));
}
export const currentReactions = (state: RootState): EmojiReactions => {
  const reactions = allCurrentMessages(state)
    .filter((msg) => msg.type === MessageType.Reaction
  );

  const codeset = currentConversation(state)?.codeset;

  if (!codeset) {
    return {};
  }

  return reactions
    .filter((m) => typeof m.parentMessageId === 'string')
    .reduce((map, { body: emoji, parentMessageId, pubkey }) => {

      return {
        ...map,
        [parentMessageId]: {
          ...map[parentMessageId],
          [emoji]: uniqBy(map[parentMessageId]?.[emoji]?.concat({ codeset, pubkey }) ?? [pubkey], (i) => i.pubkey),
        }
      };
    }, {} as EmojiReactions);
}

export const newDmsNotifications = (state: RootState) => Object.keys(state.dms.conversationsByPubkey).reduce((notifications, pubkey) => ({
  ...notifications,
  [pubkey]: state.dms.missedMessagesByPubkey[pubkey] || false,
}), {} as Record<string, boolean>);