import { Message, MessageId } from '@types';
import type { EmojiReactions, ReactionInfo } from 'src/store/types';

import { omit, uniqBy } from 'lodash';

import { MessageType } from '@types';

export const byTimestamp = <T extends { timestamp: string }>(a: T, b: T) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()

export const reactionsReducer = (state: EmojiReactions, message: Message): EmojiReactions => {
  const { 
    body: emoji,
    codeset,
    id,
    pubkey,
    repliedTo,
    status,
    type,
  } = message
  if (repliedTo === null || type !== MessageType.Reaction) {
    return state;
  }

  const info: ReactionInfo = { codeset, pubkey, status, id };

  return {
    ...state,
    [repliedTo]: {
      ...state[repliedTo],
      [emoji]: uniqBy([info].concat(state[repliedTo]?.[emoji] ?? []), (m) => m.pubkey),
    }
  };
}

export const deleteReactionReducer = (state: EmojiReactions, messageId: MessageId) => {
  let emoji: string | undefined;
  let repliedTo: string | undefined;
  Object.entries(state).some(([replyId, reactionMap]) => {
    const found = Object.entries(reactionMap).find(([, reactionInfos]) => {
      return !!reactionInfos.find((info) => info.id === messageId);
    });
    emoji = found?.[0];
    repliedTo = replyId;
    return emoji && replyId;
  });

  if (!emoji || !repliedTo) {
    return state;
  }

  const reactions = state[repliedTo]?.[emoji]?.filter(
    (r) => r.id !== messageId
  );
  
  return {
    ...state,
    [repliedTo]: reactions.length === 0
      ? omit(state[repliedTo], emoji)
      : {
      ...state[repliedTo],
      [emoji]: reactions
    },
  };
}