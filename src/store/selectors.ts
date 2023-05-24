import { createSelector } from '@reduxjs/toolkit';

import { currentDirectMessages } from './dms/selectors';
import { currentChannelMessages } from './messages/selectors';
import { dmNickname } from './dms/selectors';
import { channelNicknames, currentChannel } from './channels/selectors';

export const currentMessages = createSelector(
  currentDirectMessages,
  currentChannelMessages,
  (dms, msgs) => msgs || dms || []
)

export const currentNickname = createSelector(
  currentChannel,
  channelNicknames,
  dmNickname,
  (channel, nicknames, globalNickname) => {
    return channel?.id ? nicknames[channel?.id] : globalNickname;
  }
)