
// APIs
import { backtestApi } from '../modules/backtest/apis';
import { bybitApi } from '../modules/bybit/apis';
import { historicPairsMetaApi } from '../modules/historicPairsMeta/apis';
import { trendFollowingStrategyApi } from '../modules/strategies/trendFollowingStrategy/apis';
import { breakoutStrategyApi } from '../modules/strategies/breakoutStrategy/apis';

// slices


// ---- REDUCER ----
const rootReducer = {
  [backtestApi.reducerPath]: backtestApi.reducer,
  [bybitApi.reducerPath]: bybitApi.reducer,
  [historicPairsMetaApi.reducerPath]: historicPairsMetaApi.reducer,
  [trendFollowingStrategyApi.reducerPath]: trendFollowingStrategyApi.reducer,
  [breakoutStrategyApi.reducerPath]: breakoutStrategyApi.reducer,
};

export default rootReducer;
