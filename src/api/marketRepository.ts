import { AppState, type AppStateStatus, type NativeEventSubscription } from 'react-native';

import {
  CHANNEL,
  CONNECTION_STATUS,
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
  private readonly appStateSub: NativeEventSubscription;

  constructor(private readonly transport: MarketTransport) {
    this.buffer = new MarketBuffer(batch => useMarketStore.getState().applyBatch(batch));
    this.detachMessage = transport.onMessage(message => this.handleMessage(message));
    this.detachStatus = transport.onStatusChange(info =>
      useMarketStore.getState().setStatus(info.status, info.attempt),
    );
    this.appStateSub = AppState.addEventListener('change', this.onAppStateChange);
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

  /** Skip backoff wait — user tap or foreground resume. */
  reconnect() {
    this.transport.reconnectNow();
  }

  /** If the socket is down, try again (e.g. app returned to foreground). */
  ensureConnected() {
    const { status } = useMarketStore.getState();
    // Don't interrupt an in-flight first connect.
    if (
      status === CONNECTION_STATUS.CONNECTED ||
      status === CONNECTION_STATUS.CONNECTING
    ) {
      return;
    }
    this.transport.reconnectNow();
  }

  dispose() {
    this.appStateSub.remove();
    this.detachMessage();
    this.detachStatus();
    this.buffer.dispose();
    this.transport.disconnect();
  }

  private onAppStateChange = (next: AppStateStatus) => {
    if (next === 'active') {
      this.ensureConnected();
    }
  };

  private handleMessage(message: MarketMessage) {
    if (message.type !== MESSAGE_TYPE.SUBSCRIPTIONS) {
      this.buffer.push(message);
    }
  }
}

export const marketRepository = new MarketRepository(new WebSocketMarketTransport());
