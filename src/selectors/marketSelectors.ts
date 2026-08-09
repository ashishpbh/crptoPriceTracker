import type {
  ConnectionStatus,
  OrderbookSnapshot,
  Symbol,
  TickerMessage,
  TradeMessage,
} from '@/commonUtils';
import type { useMarketStore } from '@/stores/marketStore';

type MarketState = ReturnType<typeof useMarketStore.getState>;

const EMPTY_TRADES: TradeMessage[] = [];

export const selectConnectionStatus = (state: MarketState): ConnectionStatus => state.status;

export const selectReconnectAttempt = (state: MarketState): number => state.reconnectAttempt;

export const selectTicker =
  (symbol: Symbol) =>
  (state: MarketState): TickerMessage | undefined =>
    state.tickers[symbol];

export const selectOrderbook =
  (symbol: Symbol) =>
  (state: MarketState): OrderbookSnapshot | undefined =>
    state.orderbooks[symbol];

export const selectTrades =
  (symbol: Symbol) =>
  (state: MarketState): TradeMessage[] =>
    state.trades[symbol] ?? EMPTY_TRADES;
