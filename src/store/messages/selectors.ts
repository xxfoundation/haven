import { EmojiReactions, MessageType } from './types';
import type { RootState } from 'src/store/types';
import type { Message } from './types';

import assert from 'assert';
import { uniq } from 'lodash';

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

type Contributor = {
  codename: string;
  contributions: number;
  channelId: string;
  pubkey: string;
  color?: string;
  nickname?: string;
}

export const contributors = (state: RootState) => {
  const contributorsByFrequency = Object.values(state.messages.byId)?.reduce((acc, msg) => ({
    ...acc,
    [msg.codename]: {
      ...acc[msg.codename],
      ...msg,
      channelId: msg.channelId,
      contributions: (acc[msg.codename]?.contributions ?? 0) + 1
    },
  }), {} as Record<string, Contributor>);

  return Object.values(contributorsByFrequency ?? {})
    .sort((a, b) => b.contributions - a.contributions);
}