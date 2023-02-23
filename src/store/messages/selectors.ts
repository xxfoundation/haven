
import type { RootState,  EmojiReactions } from 'src/store/types';
import type { Message } from './types';

import { byTimestamp } from '../utils';
import { MessageType } from 'src/types';

import assert from 'assert';
import { uniqBy } from 'lodash';

export const allMessages = (state: RootState) => Object.values(state.messages.byId);

export const currentChannelMessages = (state: RootState) => {
  if (state.app.selectedChannelId === null) {
    return undefined;
  }

  return Object.values(state.messages.byId)
    .filter((msg) =>
      !msg.hidden
      && [MessageType.Normal, MessageType.Reply].includes(msg.type)
      && msg.channelId === state.app.selectedChannelId
    ).sort(byTimestamp);
}

export const channelReactions = (state: RootState): EmojiReactions => {
  const reactions = Object.values(state.messages.byId)
    .filter((msg) =>
      !msg.hidden
      && msg.type === MessageType.Reaction
      && msg.channelId === state.app.selectedChannelId
    );

  return reactions
    .filter((m) => typeof m.repliedTo === 'string')
    .reduce((map, { body: emoji, codeset, pubkey, repliedTo }) => {
      assert(repliedTo);

      return {
        ...map,
        [repliedTo]: {
          ...map[repliedTo],
          [emoji]: uniqBy(map[repliedTo]?.[emoji]?.concat({ codeset, pubkey }) ?? [{ codeset, pubkey }], (m) => m.pubkey),
        }
      };
    }, {} as EmojiReactions);
}

export const reactionsTo = (message: Message) => (state: RootState) => {
  const reactions = channelReactions(state)?.[message.id];
  return Object.entries(reactions ?? {}).sort((a, b) => b[1].length - a[1].length)
}

export const repliedTo = (message: Message) => (state: RootState) => 
  message.repliedTo && Object.values(state.messages.byId).find((msg) => msg.id === message.repliedTo);

export const currentPinnedMessages = (state: RootState) => currentChannelMessages(state)?.filter((msg) => msg.pinned);

export const allContributors = (state: RootState) => {
  return Object.values(state.messages.byId)
    .sort(byTimestamp)
    .reverse()
    .reduce((acc, cur) => uniqBy(
      acc.concat(cur)
        .sort(byTimestamp)
        .reverse(),
      (m) => m.codename
      ),
      [] as Message[]
    );
}

export const currentContributors = (state: RootState) => allContributors(state).filter((m) => m.channelId === state.app.selectedChannelId);