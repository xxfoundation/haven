import type { RootState } from 'src/store/types';
import { compose, configureStore, combineReducers } from '@reduxjs/toolkit';
import persistState from 'redux-localstorage';

import app from './app';
import channels from './channels';
import dms from './dms'
import identity from './identity';
import messages from './messages';

const enhancer = compose(
  persistState(['app']),
)

const store = configureStore({
  enhancers: typeof window === 'undefined' ? [] : [enhancer],
  reducer: combineReducers<RootState>({
    app,
    channels,
    dms,
    identity,
    messages
  })
})

export default store;
