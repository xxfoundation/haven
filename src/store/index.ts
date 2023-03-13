import type { RootState } from 'src/store/types';
import { configureStore, combineReducers } from '@reduxjs/toolkit';

import app from './app';
import channels from './channels';
import dms from './dms'
import identity from './identity';
import messages from './messages';

const store = configureStore({
  reducer: combineReducers<RootState>({
    app,
    channels,
    dms,
    identity,
    messages
  })
})

export default store;
