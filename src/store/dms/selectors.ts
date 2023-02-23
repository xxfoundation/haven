import type { EmojiReactions, RootState } from 'src/store/types';

import { uniqBy } from 'lodash';

import { MessageType } from 'src/types';
import { byTimestamp } from '../utils';
import { Conversation } from './types';

export const currentConversation = (state: RootState): Conversation | null => state.dms.conversationsByPubkey[state.dms.selectedConversationPubkey ?? ''] || null;
export const conversations = (state: RootState) => Object.values(state.dms.conversationsByPubkey);
const allCurrentMessages = (state: RootState) => Object.values(state.dms.messagesByPubkey[state.dms.selectedConversationPubkey ?? ''] ?? {});
export const currentDirectMessages = (state: RootState) =>
  allCurrentMessages(state)
    .sort(byTimestamp)
    .filter((msg) => [MessageType.Normal, MessageType.Reply].includes(msg.type));
  
export const currentReactions = (state: RootState): EmojiReactions => {
  const reactions = allCurrentMessages(state)
    .filter((msg) => msg.type === MessageType.Reaction
  );

  const codeset = currentConversation(state)?.codesetVersion;

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