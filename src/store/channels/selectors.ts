import { RootState } from 'src/store/types';
import { createSelector } from '@reduxjs/toolkit';
import { channelFavorites, channelsSearch } from '../app/selectors';
import { sortBy } from 'lodash';
import { ChannelId } from './types';

export const channels = (state: RootState) => state.channels.sortedChannels;
export const searchFilteredChannels = createSelector(
  channels,
  channelsSearch,
  channelFavorites,
  (allChannels, search, favorites) => {
    const filteredChannels = allChannels.filter(
      (c) => c.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
    )

    return sortBy(filteredChannels, (c) => favorites.includes(c.id) ? 0 : 1);
  }
)
export const currentChannel = (state: RootState) => state.app.selectedChannelIdOrConversationId !== null
  ? state.channels.byId[state.app.selectedChannelIdOrConversationId]
  : undefined;

export const channelPages = (state: RootState) => state.channels.currentPages;

export const channelNicknames = (state: RootState) => state.channels.nicknames;

export const currentChannelNickname = (channelId?: ChannelId) => (state: RootState): string | undefined => channelId && state.channels.nicknames[channelId];