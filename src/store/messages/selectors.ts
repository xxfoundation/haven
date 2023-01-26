import type { EmojiReactions } from './types';
import type { RootState } from 'src/store/types';
import type { Message } from './types';

import assert from 'assert';
import { uniq } from 'lodash';


export const currentChannelMessages = (state: RootState) => {
  if (state.channels.currentChannelId === undefined) {
    return undefined;
  }

  return Object.values(state.messages.byId)
    .filter((msg) => msg.channelId === state.channels.currentChannelId);
}

export const channelReactions = (state: RootState): EmojiReactions => {
  const messages = currentChannelMessages(state);
  if (!messages) {
    return {};
  }

  return messages
    .filter((m) => typeof m.repliedTo === 'number')
    .reduce((map, { body: emoji, codename, repliedTo }) => {
      assert(repliedTo);

      return {
        ...map,
        [repliedTo]: {
          ...map[repliedTo],
          [emoji]: uniq(map[repliedTo]?.[emoji]?.concat(codename) ?? [codename]),
        }
        
      };
    }, {} as EmojiReactions);
}

export const reactionsTo = (message: Message) => (state: RootState) => {
  const reactions = channelReactions(state)?.[message.id];
  return Object.entries(reactions).sort((a, b) => b[1].length - a[1].length)
}

export const repliedTo = (message: Message) => (state: RootState) => 
  message.repliedTo && Object.values(state.messages.byId).find((msg) => msg.id === message.repliedTo);
