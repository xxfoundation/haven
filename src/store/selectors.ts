import { createSelector } from '@reduxjs/toolkit';

import { currentDirectMessages } from './dms/selectors';
import { currentChannelMessages } from './messages/selectors';
import { dmNickname } from './dms/selectors';
import { channelNicknames, currentChannel, mutedUsers } from './channels/selectors';
import { identity } from './identity/selectors';
import { replyingToId } from './app/selectors';

export const currentMessages = createSelector(
  currentDirectMessages,
  currentChannelMessages,
  (dms, msgs) => msgs || dms || []
);

export const currentNickname = createSelector(
  currentChannel,
  channelNicknames,
  dmNickname,
  (channel, nicknames, globalNickname): string => ((channel && channel.id && nicknames[channel.id]) || globalNickname) ?? ''
);

export const userIsMuted = createSelector(
  currentChannel,
  identity,
  mutedUsers,
  (channel, ident, muted) =>
    !!(channel?.id && ident?.pubkey && muted[channel.id]?.includes(ident.pubkey))
);

export const currentMutedUsers = createSelector(
  currentChannel,
  mutedUsers,
  (channel, muted) => channel?.id ? (muted[channel.id] ?? []) : []
);


export const replyingToMessage = createSelector(
  replyingToId,
  currentChannelMessages,
  currentDirectMessages,
  (id, msgs, dms) => msgs?.find((m) => m.id === id) || dms?.find((d) => d.id === id),
);

export const fullIdentity = createSelector(
  identity,
  currentNickname,
  (ident, nickname) => ident && ({
    ...ident,
    nickname
  })
);