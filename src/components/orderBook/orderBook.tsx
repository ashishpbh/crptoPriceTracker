import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';

import {
  ORDERBOOK_ROW_HEIGHT,
  VISIBLE_ORDERBOOK_LEVELS,
  type DepthLevel,
  type OrderbookSnapshot,
} from '@/commonUtils';
import { i18 } from '@/i18';

import { OrderBookDepthRow } from './orderBookDepthRow';
import { orderBookStyles as styles } from './styles';

export function Orderbook({ orderbook }: { orderbook?: OrderbookSnapshot }) {
  const asks = useMemo(
    () => (orderbook?.asks ?? []).slice(0, VISIBLE_ORDERBOOK_LEVELS),
    [orderbook?.asks],
  );
  const bids = useMemo(
    () => (orderbook?.bids ?? []).slice(0, VISIBLE_ORDERBOOK_LEVELS),
    [orderbook?.bids],
  );
  const bestAsk = asks[0]?.price;
  const bestBid = bids[0]?.price;
  const spread = bestAsk != null && bestBid != null ? bestAsk - bestBid : null;
  const spreadPct = spread != null && bestBid ? (spread / bestBid) * 100 : null;
  const maxDepth = Math.max(
    asks[asks.length - 1]?.cumulative ?? 0,
    bids[bids.length - 1]?.cumulative ?? 0,
    1,
  );

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>{i18.orderbookTitle}</Text>
      <View style={styles.columnLabels}>
        <Text style={[styles.label, styles.colPrice]}>{i18.columnPrice}</Text>
        <Text style={[styles.label, styles.colSize]}>{i18.columnSize}</Text>
        <Text style={[styles.label, styles.colTotal]}>{i18.columnTotal}</Text>
      </View>
      {/* Asks: best near spread (bottom) via inverted FlashList — recycles when depth grows. */}
      <DepthSide levels={asks} maxDepth={maxDepth} side="ask" />
      <View style={styles.spread}>
        <Text style={styles.spreadText}>
          {spread != null && spreadPct != null
            ? `${i18.spreadLabel}: $${spread.toFixed(2)} (${spreadPct.toFixed(3)}%)`
            : `${i18.spreadLabel}: —`}
        </Text>
      </View>
      <DepthSide levels={bids} maxDepth={maxDepth} side="bid" />
      {!orderbook && <Text style={styles.loading}>{i18.waitingForOrderbook}</Text>}
    </View>
  );
}

function DepthSide({
  levels,
  maxDepth,
  side,
}: {
  levels: DepthLevel[];
  maxDepth: number;
  side: 'ask' | 'bid';
}) {
  const inverted = side === 'ask';
  // Cap at content height so small books stay tight; flex:1 splits the pane when levels grow.
  const contentHeight = levels.length * ORDERBOOK_ROW_HEIGHT;

  const renderItem = useCallback(
    ({ item }: { item: DepthLevel }) => (
      <OrderBookDepthRow level={item} maxDepth={maxDepth} side={side} />
    ),
    [maxDepth, side],
  );

  const keyExtractor = useCallback(
    (item: DepthLevel) => `${side}-${item.price}`,
    [side],
  );

  return (
    <View style={[styles.depthList, { maxHeight: contentHeight }]}>
      <FlashList
        data={levels}
        extraData={maxDepth}
        inverted={inverted}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
