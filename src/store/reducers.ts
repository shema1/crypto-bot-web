import { historicPairsMetaApi } from '../modules/historicPairsMeta/apis';

// APIs

// slices

const initialStateMap: Record<string, any> = {};

// ---- REDUCER ----
const rootReducer = {
  [historicPairsMetaApi.reducerPath]: historicPairsMetaApi.reducer,
};

export default rootReducer;
