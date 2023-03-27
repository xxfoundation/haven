import { RootState } from 'src/store/types';

export const channels = (state: RootState) => state.channels.sortedChannels;

export const currentChannel = (state: RootState) => state.app.selectedChannelId !== null
  ? state.channels.byId[state.app.selectedChannelId]
  : undefined;

export const missedMessages = (state: RootState) => state.channels.missedMessages;
export const channelPages = (state: RootState) => state.channels.currentPages;