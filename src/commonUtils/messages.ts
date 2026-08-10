import type { MarketChannel } from './channels';
import { MESSAGE_TYPE, SUBSCRIPTION_ACTION, TRADE_ROLE } from './marketConstants';
import type { Symbol } from './symbols';

export interface TickerMessage {
  type: typeof MESSAGE_TYPE.TICKER;
  symbol: Symbol;
  close: number;
  mark_price: string;
  volume: number;
  high: number;
  low: number;
  funding_rate: string;
  ltp_change_24h: string;
  timestamp: number;
}

export interface OrderbookMessage {
  type: typeof MESSAGE_TYPE.ORDERBOOK;
  symbol: Symbol;
  bids: [price: string, quantity: string][];
  asks: [price: string, quantity: string][];
  timestamp: number;
}

export interface TradeMessage {
  type: typeof MESSAGE_TYPE.TRADES;
  symbol: Symbol;
  price: string;
  size: number;
  buyer_role: (typeof TRADE_ROLE)[keyof typeof TRADE_ROLE];
  seller_role: (typeof TRADE_ROLE)[keyof typeof TRADE_ROLE];
  timestamp: number;
  /** Instrument id from server (same for all trades of a symbol — not unique per print). */
  product_id?: number;
  /**
   * App-assigned unique row id (`${product_id|symbol}_${seq}`).
   * Server all_trades has no trade_id; FlashList needs a stable unique key.
   */
  id?: string;
}

export interface SubscriptionsAck {
  type: typeof MESSAGE_TYPE.SUBSCRIPTIONS;
  payload: {
    channels: Array<{ name: MarketChannel; symbols: Symbol[] }>;
  };
}

export type MarketMessage = TickerMessage | OrderbookMessage | TradeMessage | SubscriptionsAck;

export interface SubscriptionRequest {
  type: (typeof SUBSCRIPTION_ACTION)[keyof typeof SUBSCRIPTION_ACTION];
  payload: {
    channels: Array<{ name: MarketChannel; symbols?: Symbol[] }>;
  };
}
