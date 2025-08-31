import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { AppState, AppDispatch } from './';

export const useAppDispatch: () => AppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
