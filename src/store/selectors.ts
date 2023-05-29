import { createSelector } from '@reduxjs/toolkit';

import { currentDirectMessages } from './dms/selectors';
import { currentChannelMessages } from './messages/selectors';
import { dmNickname } from './dms/selectors';
import { channelNicknames, currentChannel, mutedUsers } from './channels/selectors';
import { identity } from './identity/selectors';

export const currentMessages = createSelector(
  currentDirectMessages,
  currentChannelMessages,
  (dms, msgs) => msgs || dms || []
);

export const currentNickname = createSelector(
  currentChannel,
  channelNicknames,
  dmNickname,
  (channel, nicknames, globalNickname) => {
    return channel?.id ? nicknames[channel?.id] : globalNickname;
  }
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
