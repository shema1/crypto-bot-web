
// APIs
import { historicPairsMetaApi } from '../modules/historicPairsMeta/apis';

// slices


// ---- REDUCER ----
const rootReducer = {
  [historicPairsMetaApi.reducerPath]: historicPairsMetaApi.reducer,
};

export default rootReducer;
