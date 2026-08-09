import {
  MESSAGE_TYPE,
  VISIBLE_DEPTH,
  type DepthLevel,
  type MarketMessage,
  type OrderbookSnapshot,
  type Symbol,
  type TickerMessage,
  type TradeMessage,
} from '@/commonUtils';

export interface MarketBatch {
  tickers: Partial<Record<Symbol, TickerMessage>>;
  orderbooks: Partial<Record<Symbol, OrderbookSnapshot>>;
  trades: Partial<Record<Symbol, TradeMessage[]>>;
}

type FlushListener = (batch: MarketBatch) => void;

type StreamMessage = Exclude<MarketMessage, { type: typeof MESSAGE_TYPE.SUBSCRIPTIONS }>;

/**
 * Holds fast WebSocket updates and applies them to the store once per screen frame.
 */
export class MarketBuffer {
  private readonly latestTickers = new Map<Symbol, TickerMessage>();
  private readonly latestOrderbooks = new Map<Symbol, OrderbookSnapshot>();
  private readonly pendingTrades = new Map<Symbol, TradeMessage[]>();
  private frameId: number | null = null;

  constructor(private readonly onFlush: FlushListener) {}

  push(message: StreamMessage) {
    if (message.type === MESSAGE_TYPE.TICKER) {
      this.latestTickers.set(message.symbol, message);
    } else if (message.type === MESSAGE_TYPE.ORDERBOOK) {
      this.latestOrderbooks.set(
        message.symbol,
        toOrderbookSnapshot(message.bids, message.asks, message.timestamp),
      );
    } else {
      const symbolTrades = this.pendingTrades.get(message.symbol) ?? [];
      symbolTrades.push(message);
      this.pendingTrades.set(message.symbol, symbolTrades);
    }

    this.scheduleFlush();
  }

  dispose() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.latestTickers.clear();
    this.latestOrderbooks.clear();
    this.pendingTrades.clear();
  }

  private scheduleFlush() {
    if (this.frameId !== null) return;
    this.frameId = requestAnimationFrame(() => this.flush());
  }

  private flush() {
    this.frameId = null;
    const tickers: MarketBatch['tickers'] = {};
    const orderbooks: MarketBatch['orderbooks'] = {};
    const trades: MarketBatch['trades'] = {};

    for (const [symbol, ticker] of this.latestTickers) tickers[symbol] = ticker;
    for (const [symbol, book] of this.latestOrderbooks) orderbooks[symbol] = book;
    for (const [symbol, symbolTrades] of this.pendingTrades) trades[symbol] = symbolTrades;

    this.latestTickers.clear();
    this.latestOrderbooks.clear();
    this.pendingTrades.clear();
    this.onFlush({ tickers, orderbooks, trades });
  }
}

function toOrderbookSnapshot(
  rawBids: [string, string][],
  rawAsks: [string, string][],
  timestamp: number,
): OrderbookSnapshot {
  return {
    bids: toDepthLevels(rawBids, 'desc'),
    asks: toDepthLevels(rawAsks, 'asc'),
    timestamp,
  };
}

function toDepthLevels(levels: [string, string][], direction: 'asc' | 'desc'): DepthLevel[] {
  const preferAsc = direction === 'asc';
  const best: { price: number; quantity: number }[] = [];

  for (let index = 0; index < levels.length; index++) {
    const price = Number(levels[index][0]);
    const quantity = Number(levels[index][1]);
    if (!Number.isFinite(price) || !Number.isFinite(quantity)) continue;

    if (best.length < VISIBLE_DEPTH) {
      best.push({ price, quantity });
      if (best.length === VISIBLE_DEPTH) sortDepth(best, preferAsc);
      continue;
    }

    const worst = best[VISIBLE_DEPTH - 1];
    const isBetter = preferAsc ? price < worst.price : price > worst.price;
    if (!isBetter) continue;
    best[VISIBLE_DEPTH - 1] = { price, quantity };
    sortDepth(best, preferAsc);
  }

  if (best.length < VISIBLE_DEPTH) sortDepth(best, preferAsc);

  let cumulative = 0;
  return best.map(level => {
    cumulative += level.quantity;
    return { ...level, cumulative };
  });
}

function sortDepth(levels: { price: number; quantity: number }[], preferAsc: boolean) {
  levels.sort((left, right) => (preferAsc ? left.price - right.price : right.price - left.price));
}
