
// APIs
import { bybitApi } from '../modules/bybit/apis';
import { historicPairsMetaApi } from '../modules/historicPairsMeta/apis';

// slices


// ---- REDUCER ----
const rootReducer = {
  [bybitApi.reducerPath]: bybitApi.reducer,
  [historicPairsMetaApi.reducerPath]: historicPairsMetaApi.reducer,
};

export default rootReducer;
