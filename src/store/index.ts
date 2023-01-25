import type { RootState } from 'src/store/types';
import { configureStore, combineReducers } from '@reduxjs/toolkit';

import messages from './messages';
import channels from './channels';

const store = configureStore({
  reducer: combineReducers<RootState>({
    channels,
    messages
  })
})

export default store;
