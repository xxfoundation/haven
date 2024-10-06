import type { Identity, IdentityState } from './types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: IdentityState = {
  identity: undefined
};

const slice = createSlice({
  name: 'identity',
  initialState,
  reducers: {
    set: (state: IdentityState, action: PayloadAction<Identity>) => ({
      identity: action.payload || state.identity
    })
  }
});

export default slice.reducer;

export const { actions } = slice;

export * as selectors from './selectors';
