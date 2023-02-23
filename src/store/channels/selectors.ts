import { RootState } from 'src/store/types';

export const channels = (state: RootState) => 
  Object.values(state.channels.byId)
    .sort((a, b) => a.name.localeCompare(b.name));

export const currentChannel = (state: RootState) => state.app.selectedChannelId !== null
  ? state.channels.byId[state.app.selectedChannelId]
  : undefined;
