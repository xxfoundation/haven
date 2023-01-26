import type { RootState } from 'src/store/types';
import { configureStore, combineReducers } from '@reduxjs/toolkit';

import channels from './channels';
import identity from './identity';
import messages from './messages';

const store = configureStore({
  reducer: combineReducers<RootState>({
    channels,
    identity,
    messages
  })
})

export default store;
