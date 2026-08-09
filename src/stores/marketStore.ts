import { create } from 'zustand';

import type { MarketBatch } from '@/api/marketBuffer';
import {
  CONNECTION_STATUS,
  MAX_TRADES_PER_SYMBOL,
  type ConnectionStatus,
  type OrderbookSnapshot,
  type Symbol,
  type TickerMessage,
  type TradeMessage,
} from '@/commonUtils';

interface MarketState {
  status: ConnectionStatus;
  tickers: Partial<Record<Symbol, TickerMessage>>;
  orderbooks: Partial<Record<Symbol, OrderbookSnapshot>>;
  trades: Partial<Record<Symbol, TradeMessage[]>>;
  setStatus: (status: ConnectionStatus) => void;
  applyBatch: (batch: MarketBatch) => void;
}

/** Reuse prior ticker when UI-visible fields are unchanged (avoids row re-renders). */
function tickersEqualForUi(left: TickerMessage | undefined, right: TickerMessage): boolean {
  if (!left) return false;
  return (
    left.close === right.close &&
    left.ltp_change_24h === right.ltp_change_24h &&
    left.mark_price === right.mark_price &&
    left.volume === right.volume &&
    left.high === right.high &&
    left.low === right.low &&
    left.funding_rate === right.funding_rate
  );
}

export const useMarketStore = create<MarketState>(set => ({
  status: CONNECTION_STATUS.DISCONNECTED,
  tickers: {},
  orderbooks: {},
  trades: {},
  setStatus: status => set({ status }),
  applyBatch: batch =>
    set(state => {
      let nextTickers = state.tickers;
      const tickerEntries = Object.entries(batch.tickers) as [Symbol, TickerMessage][];
      if (tickerEntries.length > 0) {
        let draft: Partial<Record<Symbol, TickerMessage>> | null = null;
        for (const [symbol, ticker] of tickerEntries) {
          if (tickersEqualForUi(state.tickers[symbol], ticker)) continue;
          if (!draft) draft = { ...state.tickers };
          draft[symbol] = ticker;
        }
        if (draft) nextTickers = draft;
      }

      let nextOrderbooks = state.orderbooks;
      if (Object.keys(batch.orderbooks).length > 0) {
        nextOrderbooks = { ...state.orderbooks, ...batch.orderbooks };
      }

      let nextTrades = state.trades;
      const tradeEntries = Object.entries(batch.trades) as [Symbol, TradeMessage[]][];
      if (tradeEntries.length > 0) {
        nextTrades = { ...state.trades };
        for (const [symbol, incomingTrades] of tradeEntries) {
          nextTrades[symbol] = [
            ...incomingTrades.reverse(),
            ...(state.trades[symbol] ?? []),
          ].slice(0, MAX_TRADES_PER_SYMBOL);
        }
      }

      if (
        nextTickers === state.tickers &&
        nextOrderbooks === state.orderbooks &&
        nextTrades === state.trades
      ) {
        return state;
      }

      return {
        tickers: nextTickers,
        orderbooks: nextOrderbooks,
        trades: nextTrades,
      };
    }),
}));
