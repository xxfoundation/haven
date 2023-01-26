import { RootState } from 'src/store/types';

export const channels = (state: RootState) => 
  Object.values(state.channels.byId)
    .sort((a, b) => a.name.localeCompare(b.name));

export const currentChannel = (state: RootState) => state.channels.currentChannelId !== undefined
  ? state.channels.byId[state.channels.currentChannelId]
  : undefined;
