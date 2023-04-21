import { createSelector } from '@reduxjs/toolkit';

import { currentDirectMessages } from './dms/selectors';
import { currentChannelMessages } from './messages/selectors';

export const currentMessages = createSelector(
  currentDirectMessages,
  currentChannelMessages,
  (dms, msgs) => msgs || dms || []
)