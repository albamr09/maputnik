import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { AppState, AppDispatch } from './';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
