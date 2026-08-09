import {
  CHANNEL,
  CONNECTION_STATUS,
  SUBSCRIPTION_ACTION,
  UNSUBSCRIBE_GRACE_MS,
  exponentialBackoffMs,
  type ConnectionInfo,
  type ConnectionStatus,
  type MarketChannel,
  type MarketMessage,
  type SubscriptionRequest,
  type Symbol,
  type Cleanup,
} from '@/commonUtils';

import { marketConfig } from './marketConfig';

export interface MarketTransport {
  connect(): void;
  disconnect(): void;
  /** Cancel backoff wait and connect immediately (user retry / AppState). */
  reconnectNow(): void;
  subscribe(channel: MarketChannel, symbol: Symbol): Cleanup;
  onMessage(listener: (message: MarketMessage) => void): Cleanup;
  onStatusChange(listener: (info: ConnectionInfo) => void): Cleanup;
}

export class WebSocketMarketTransport implements MarketTransport {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = CONNECTION_STATUS.DISCONNECTED;
  private lastPublished: ConnectionInfo | null = null;
  private readonly messageListeners = new Set<(message: MarketMessage) => void>();
  private readonly statusListeners = new Set<(info: ConnectionInfo) => void>();
  private readonly subscriptions = new Map<MarketChannel, Map<Symbol, number>>();
  private readonly pendingUnsubscribes = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly pendingSubscribeSymbols = new Map<MarketChannel, Set<Symbol>>();
  private subscribeFlushTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private retryCount = 0;
  private intentionalClose = false;
  /** Bumped when retiring a socket so a late async onclose cannot schedule a ghost reconnect. */
  private socketGeneration = 0;

  constructor(private readonly url = marketConfig.wsUrl) {}

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.intentionalClose = false;
    this.setStatus(
      this.retryCount === 0
        ? CONNECTION_STATUS.CONNECTING
        : CONNECTION_STATUS.RECONNECTING,
    );
    const generation = this.socketGeneration;
    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.onopen = () => {
      if (generation !== this.socketGeneration || this.socket !== socket) return;
      this.retryCount = 0;
      this.setStatus(CONNECTION_STATUS.CONNECTED);
      if (this.subscribeFlushTimer) clearTimeout(this.subscribeFlushTimer);
      this.subscribeFlushTimer = null;
      this.pendingSubscribeSymbols.clear();
      this.sendCurrentSubscriptions();
    };

    socket.onmessage = event => {
      if (generation !== this.socketGeneration) return;
      this.handleMessage(event.data);
    };
    socket.onerror = () => {
      if (generation !== this.socketGeneration) return;
      socket.close();
    };
    socket.onclose = () => {
      // Stale socket after reconnectNow/disconnect — ignore completely.
      if (generation !== this.socketGeneration) return;
      if (this.socket === socket) this.socket = null;
      if (this.intentionalClose) {
        this.setStatus(CONNECTION_STATUS.DISCONNECTED);
        return;
      }
      this.scheduleReconnect();
    };
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.clearPendingUnsubscribes();
    if (this.subscribeFlushTimer) clearTimeout(this.subscribeFlushTimer);
    this.subscribeFlushTimer = null;
    this.pendingSubscribeSymbols.clear();
    this.retireSocket();
    this.retryCount = 0;
    this.setStatus(CONNECTION_STATUS.DISCONNECTED);
  }

  reconnectNow() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    // Retire the live socket (generation++) before opening a new one so its
    // async onclose cannot call scheduleReconnect after intentionalClose flips.
    this.retireSocket();
    this.intentionalClose = false;
    this.connect();
  }

  /** Drop the current socket and invalidate its handlers via generation bump. */
  private retireSocket() {
    this.socketGeneration += 1;
    const socket = this.socket;
    this.socket = null;
    if (!socket) return;
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
    socket.close();
  }

  // Note:
  // subscriptions shape (like JS object):
  // {
  //   ticker: { BTC: 2, ETH: 1 },
  //   orderbook: { BTC: 1 },
  // }
  //
  // Grace period (UNSUBSCRIBE_GRACE_MS = 100):
  // React Strict Mode remounts can unmount→remount quickly.
  // Without delay: SUBSCRIBE → UNSUBSCRIBE → SUBSCRIBE (wasteful flap).
  // With delay: unmount starts a 100ms timer; if remount happens first,
  // cancel the timer and keep the server subscription alive.
  // Only send UNSUBSCRIBE if nobody resubscribes within 100ms.

  subscribe(channel: MarketChannel, symbol: Symbol): Cleanup {
    const key = subscriptionKey(channel, symbol);
    const hadPendingUnsubscribe = this.pendingUnsubscribes.has(key);
    if (hadPendingUnsubscribe) {
      clearTimeout(this.pendingUnsubscribes.get(key)!);
      this.pendingUnsubscribes.delete(key);
    }

    const symbols = this.subscriptions.get(channel) ?? new Map<Symbol, number>();
    const currentCount = symbols.get(symbol) ?? 0;
    symbols.set(symbol, currentCount + 1);
    this.subscriptions.set(channel, symbols);

    if (currentCount === 0 && !hadPendingUnsubscribe) {
      this.queueSubscribe(channel, symbol);
    }
    this.connect();
    this.logSubscriptionCounts('subscribe', channel, symbol);

    return () => this.unsubscribe(channel, symbol);
  }

  onMessage(listener: (message: MarketMessage) => void): Cleanup {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  onStatusChange(listener: (info: ConnectionInfo) => void): Cleanup {
    this.statusListeners.add(listener);
    listener(this.connectionInfo());
    return () => this.statusListeners.delete(listener);
  }

  private unsubscribe(channel: MarketChannel, symbol: Symbol) {
    const symbols = this.subscriptions.get(channel);
    if (!symbols) return;
    const count = symbols.get(symbol) ?? 0;
    if (count <= 0) return;
    if (count > 1) {
      symbols.set(symbol, count - 1);
      this.logSubscriptionCounts('unsubscribe', channel, symbol);
      return;
    }

    symbols.set(symbol, 0);
    this.logSubscriptionCounts('unsubscribe (grace)', channel, symbol);
    const key = subscriptionKey(channel, symbol);
    if (this.pendingUnsubscribes.has(key)) {
      clearTimeout(this.pendingUnsubscribes.get(key)!);
    }

    this.pendingUnsubscribes.set(
      key,
      setTimeout(() => {
        this.pendingUnsubscribes.delete(key);
        const live = this.subscriptions.get(channel);
        if (!live || (live.get(symbol) ?? 0) > 0) return;

        live.delete(symbol);
        if (live.size === 0) this.subscriptions.delete(channel);
        this.send({
          type: SUBSCRIPTION_ACTION.UNSUBSCRIBE,
          payload: { channels: [{ name: channel, symbols: [symbol] }] },
        });
        this.logSubscriptionCounts('unsubscribed', channel, symbol);
      }, UNSUBSCRIBE_GRACE_MS),
    );
  }

  /**
   * DEV-only: live ref-count snapshot for demos / interviews.
   * Shape: { BTCUSD: { ticker: 2, orderbook: 1, trades: 1 } }
   */
  private logSubscriptionCounts(
    reason: string,
    channel: MarketChannel,
    symbol: Symbol,
  ) {
    if (!__DEV__) return;

    const bySymbol: Record<string, Record<string, number>> = {};
    for (const [ch, symbols] of this.subscriptions) {
      const short =
        ch === CHANNEL.TICKER
          ? 'ticker'
          : ch === CHANNEL.ORDERBOOK
            ? 'orderbook'
            : ch === CHANNEL.TRADES
              ? 'trades'
              : ch;
      for (const [sym, count] of symbols) {
        if (count <= 0) continue;
        bySymbol[sym] ??= {};
        bySymbol[sym][short] = count;
      }
    }
    console.log(`[WS subscriptions] ${reason} ${channel} ${symbol}`, bySymbol);
  }

  private queueSubscribe(channel: MarketChannel, symbol: Symbol) {
    const pending = this.pendingSubscribeSymbols.get(channel) ?? new Set<Symbol>();
    pending.add(symbol);
    this.pendingSubscribeSymbols.set(channel, pending);

    if (this.subscribeFlushTimer) return;
    this.subscribeFlushTimer = setTimeout(() => {
      this.subscribeFlushTimer = null;
      this.flushPendingSubscribes();
    }, 0);
  }

  private flushPendingSubscribes() {
    if (this.pendingSubscribeSymbols.size === 0) return;
    if (this.socket?.readyState !== WebSocket.OPEN) return;

    const channels = [...this.pendingSubscribeSymbols].map(([name, symbols]) => ({
      name,
      symbols: [...symbols],
    }));
    this.pendingSubscribeSymbols.clear();
    if (channels.some(channel => channel.symbols.length)) {
      this.send({ type: SUBSCRIPTION_ACTION.SUBSCRIBE, payload: { channels } });
    }
  }

  private sendCurrentSubscriptions() {
    const channels = [...this.subscriptions].flatMap(([name, symbols]) => {
      const subscribedSymbols = [...symbols.entries()]
        .filter(([, count]) => count > 0)
        .map(([symbol]) => symbol);
      return subscribedSymbols.length ? [{ name, symbols: subscribedSymbols }] : [];
    });
    if (channels.length) {
      this.send({ type: SUBSCRIPTION_ACTION.SUBSCRIBE, payload: { channels } });
    }
  }

  private clearPendingUnsubscribes() {
    for (const timer of this.pendingUnsubscribes.values()) clearTimeout(timer);
    this.pendingUnsubscribes.clear();
  }

  private send(request: SubscriptionRequest) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(request));
    }
  }

  private handleMessage(raw: unknown) {
    if (typeof raw !== 'string') return;
    try {
      const message = JSON.parse(raw) as MarketMessage;
      this.messageListeners.forEach(listener => listener(message));
    } catch {
      // Ignore malformed payloads so one bad message cannot stop the stream.
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || this.intentionalClose) return;
    const delay = exponentialBackoffMs(this.retryCount);
    this.retryCount += 1;
    this.setStatus(CONNECTION_STATUS.RECONNECTING);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private connectionInfo(): ConnectionInfo {
    const attempt =
      this.status === CONNECTION_STATUS.CONNECTED ||
      this.status === CONNECTION_STATUS.DISCONNECTED
        ? 0
        : this.retryCount;
    return { status: this.status, attempt };
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    const info = this.connectionInfo();
    if (
      this.lastPublished &&
      this.lastPublished.status === info.status &&
      this.lastPublished.attempt === info.attempt
    ) {
      return;
    }
    this.lastPublished = info;
    this.statusListeners.forEach(listener => listener(info));
  }
}

function subscriptionKey(channel: MarketChannel, symbol: Symbol) {
  return `${channel}:${symbol}`;
}
