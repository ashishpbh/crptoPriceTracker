import {
  CHANNEL,
  MESSAGE_TYPE,
  type MarketMessage,
  type Symbol,
  type Cleanup,
} from '@/commonUtils';
import { useMarketStore } from '@/stores/marketStore';

import { MarketBuffer } from './marketBuffer';
import { WebSocketMarketTransport, type MarketTransport } from './websocketClient';

/** App-facing market API. UI never opens a WebSocket directly. */
export class MarketRepository {
  private readonly buffer: MarketBuffer;
  private readonly detachMessage: Cleanup;
  private readonly detachStatus: Cleanup;

  constructor(private readonly transport: MarketTransport) {
    this.buffer = new MarketBuffer(batch => useMarketStore.getState().applyBatch(batch));
    this.detachMessage = transport.onMessage(message => this.handleMessage(message));
    this.detachStatus = transport.onStatusChange(status =>
      useMarketStore.getState().setStatus(status),
    );
  }

  watchTicker(symbol: Symbol) {
    return this.transport.subscribe(CHANNEL.TICKER, symbol);
  }

  watchOrderbook(symbol: Symbol) {
    return this.transport.subscribe(CHANNEL.ORDERBOOK, symbol);
  }

  watchTrades(symbol: Symbol) {
    return this.transport.subscribe(CHANNEL.TRADES, symbol);
  }

  dispose() {
    this.detachMessage();
    this.detachStatus();
    this.buffer.dispose();
    this.transport.disconnect();
  }

  private handleMessage(message: MarketMessage) {
    if (message.type !== MESSAGE_TYPE.SUBSCRIPTIONS) {
      this.buffer.push(message);
    }
  }
}

export const marketRepository = new MarketRepository(new WebSocketMarketTransport());
