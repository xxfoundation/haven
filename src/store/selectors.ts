import { RootState } from 'src/store/types';

export const currentChannelMessages = (state: RootState) => Object.values(state.messages.byId).filter((m) => state.channels.currentChannel && m.channelId === state.channels.currentChannel);
