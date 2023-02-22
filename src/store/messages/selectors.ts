
import type { RootState } from 'src/store/types';
import type { EmojiReactions, Message } from './types';

import { MessageType } from 'src/types';

import assert from 'assert';
import { uniq, uniqBy } from 'lodash';

const byTimestamp = <T extends { timestamp: string }>(a: T, b: T) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()

export const allMessages = (state: RootState) => Object.values(state.messages.byId);

export const currentChannelMessages = (state: RootState) => {
  if (state.channels.currentChannelId === undefined) {
    return undefined;
  }

  return Object.values(state.messages.byId)
    .filter((msg) =>
      !msg.hidden
      && [MessageType.Normal, MessageType.Reply].includes(msg.type)
      && msg.channelId === state.channels.currentChannelId
    ).sort(byTimestamp);
}

export const channelReactions = (state: RootState): EmojiReactions => {
  const reactions = Object.values(state.messages.byId)
    .filter((msg) =>
      !msg.hidden
      && msg.type === MessageType.Reaction
      && msg.channelId === state.channels.currentChannelId
    );

  return reactions
    .filter((m) => typeof m.repliedTo === 'string')
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

export const currentContributors = (state: RootState) => allContributors(state).filter((m) => m.channelId === state.channels.currentChannelId);