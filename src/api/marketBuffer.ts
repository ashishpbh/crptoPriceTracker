import {
  MESSAGE_TYPE,
  TICKER_UI_THROTTLE_MS,
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

// Note:
// Fast WebSocket messages land here first; we do not push every one to the store/UI.
// Like a mailbox: many letters arrive, we only bring the newest pile inside.
//
// Strategy (channel-aware):
// - Tickers: THROTTLE (when) + rAF (how).
//   Throttle caps UI rate (TICKER_UI_THROTTLE_MS). rAF aligns the store write with paint.
//   Latest price in the window wins. First tick after idle: delay 0 → rAF ASAP.
//   TICKER_UI_THROTTLE_MS = 0 → rAF only (same cadence as the old ticker path).
// - Orderbook / trades: rAF only — detail must stay snappy.
export class MarketBuffer {
  private readonly latestTickers = new Map<Symbol, TickerMessage>();
  private readonly latestOrderbooks = new Map<Symbol, OrderbookSnapshot>();
  private readonly pendingTrades = new Map<Symbol, TradeMessage[]>();

  private bookFrameId: number | null = null;
  private tickerFrameId: number | null = null;
  private tickerThrottleTimer: ReturnType<typeof setTimeout> | null = null;
  private lastTickerFlushAt = 0;
  /** Monotonic seq for local trade ids (server has no per-trade id). */
  private tradeSeq = 0;

  constructor(private readonly onFlush: FlushListener) {}

  push(message: StreamMessage) {
    if (message.type === MESSAGE_TYPE.TICKER) {
      this.latestTickers.set(message.symbol, message);
      this.scheduleTickerFlush();
      return;
    }

    if (message.type === MESSAGE_TYPE.ORDERBOOK) {
      this.latestOrderbooks.set(
        message.symbol,
        toOrderbookSnapshot(message.bids, message.asks, message.timestamp),
      );
    } else {
      const stamped = this.stampTradeId(message);
      const symbolTrades = this.pendingTrades.get(stamped.symbol) ?? [];
      symbolTrades.push(stamped);
      this.pendingTrades.set(stamped.symbol, symbolTrades);
    }

    this.scheduleBookFrameFlush();
  }

  /** `product_id_seq` — product_id alone is the instrument, not unique per trade. */
  private stampTradeId(trade: TradeMessage): TradeMessage {
    this.tradeSeq += 1;
    const productKey = trade.product_id ?? trade.symbol;
    return { ...trade, id: `${productKey}_${this.tradeSeq}` };
  }

  dispose() {
    if (this.bookFrameId !== null) {
      cancelAnimationFrame(this.bookFrameId);
      this.bookFrameId = null;
    }
    if (this.tickerFrameId !== null) {
      cancelAnimationFrame(this.tickerFrameId);
      this.tickerFrameId = null;
    }
    if (this.tickerThrottleTimer !== null) {
      clearTimeout(this.tickerThrottleTimer);
      this.tickerThrottleTimer = null;
    }
    this.latestTickers.clear();
    this.latestOrderbooks.clear();
    this.pendingTrades.clear();
  }

  /**
   * Throttle decides WHEN we are allowed to publish; rAF decides HOW we publish
   * (on the next paint). Avoids setTimeout store writes fighting the render loop.
   */
  private scheduleTickerFlush() {
    if (this.tickerThrottleTimer !== null || this.tickerFrameId !== null) return;

    const elapsed = Date.now() - this.lastTickerFlushAt;
    const delay =
      elapsed >= TICKER_UI_THROTTLE_MS ? 0 : TICKER_UI_THROTTLE_MS - elapsed;

    this.tickerThrottleTimer = setTimeout(() => {
      this.tickerThrottleTimer = null;
      this.scheduleTickerFrameFlush();
    }, delay);
  }

  private scheduleTickerFrameFlush() {
    if (this.tickerFrameId !== null) return;
    this.tickerFrameId = requestAnimationFrame(() => {
      this.tickerFrameId = null;
      this.flushTickers();
    });
  }

  private scheduleBookFrameFlush() {
    if (this.bookFrameId !== null) return;
    this.bookFrameId = requestAnimationFrame(() => {
      this.bookFrameId = null;
      this.flushBooksAndTrades();
    });
  }

  private flushTickers() {
    if (this.latestTickers.size === 0) return;

    const tickers: MarketBatch['tickers'] = {};
    for (const [symbol, ticker] of this.latestTickers) tickers[symbol] = ticker;
    this.latestTickers.clear();
    this.lastTickerFlushAt = Date.now();
    this.onFlush({ tickers, orderbooks: {}, trades: {} });
  }

  private flushBooksAndTrades() {
    const orderbooks: MarketBatch['orderbooks'] = {};
    const trades: MarketBatch['trades'] = {};

    for (const [symbol, book] of this.latestOrderbooks) orderbooks[symbol] = book;
    for (const [symbol, symbolTrades] of this.pendingTrades) trades[symbol] = symbolTrades;

    this.latestOrderbooks.clear();
    this.pendingTrades.clear();

    if (Object.keys(orderbooks).length === 0 && Object.keys(trades).length === 0) {
      return;
    }

    this.onFlush({ tickers: {}, orderbooks, trades });
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
    // Skip invalid / zero-size levels so the UI never paints a blank depth slot.
    if (!Number.isFinite(price) || !Number.isFinite(quantity) || quantity <= 0) continue;

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
