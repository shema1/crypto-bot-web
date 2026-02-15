
// APIs
import { bybitApi } from '../modules/bybit/apis';
import { historicPairsMetaApi } from '../modules/historicPairsMeta/apis';
import { trendFollowingStrategyApi } from '../modules/strategies/trendFollowingStrategy/apis';

// slices


// ---- REDUCER ----
const rootReducer = {
  [bybitApi.reducerPath]: bybitApi.reducer,
  [historicPairsMetaApi.reducerPath]: historicPairsMetaApi.reducer,
  [trendFollowingStrategyApi.reducerPath]: trendFollowingStrategyApi.reducer,
};

export default rootReducer;
