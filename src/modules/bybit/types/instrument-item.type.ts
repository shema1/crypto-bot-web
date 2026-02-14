/** Instrument (trading pair) from Bybit instruments API */
export interface InstrumentItem {
  symbol: string;
  status: string;
  baseCoin: string;
  quoteCoin: string;
}
