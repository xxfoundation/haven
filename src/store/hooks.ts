import type { RootState } from 'src/store/types';
import type { AnyAction, Dispatch, CombinedState, ThunkDispatch } from '@reduxjs/toolkit';

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

type AppDispatch = ThunkDispatch<CombinedState<RootState>, undefined, AnyAction> &
  Dispatch<AnyAction>;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
