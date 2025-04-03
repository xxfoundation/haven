import { configureStore } from '@reduxjs/toolkit';
import channelsReducer from './channels';
import messagesReducer from './messages';
import identityReducer from './identity';
import dmsReducer from './dms';
import appReducer from './app';

const store = configureStore({
  reducer: {
    channels: channelsReducer,
    messages: messagesReducer,
    identity: identityReducer,
    dms: dmsReducer,
    app: appReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
