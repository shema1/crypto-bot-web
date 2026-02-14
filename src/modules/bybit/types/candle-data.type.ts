/** Single OHLCV candle from Bybit kline API */
export interface CandleData {
  startTime: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume?: number;
  turnover?: number;
}
