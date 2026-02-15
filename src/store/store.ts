import { useDispatch } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import rootReducer from './reducers';
import { bybitApi } from '../modules/bybit/apis';
import { historicPairsMetaApi } from '../modules/historicPairsMeta/apis';
import { trendFollowingStrategyApi } from '../modules/strategies/trendFollowingStrategy/apis';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      bybitApi.middleware,
      historicPairsMetaApi.middleware,
      trendFollowingStrategyApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch<AppDispatch>;
