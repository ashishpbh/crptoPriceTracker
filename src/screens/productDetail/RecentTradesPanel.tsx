import { FlashList } from '@shopify/flash-list';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { TRADE_ROW_HEIGHT, type TradeMessage } from '@/commonUtils';
import { SkeletonRows } from '@/components/skeleton';
import { TradeRow } from '@/components/tradeRow';
import { i18 } from '@/i18';

import { productDetailStyles as styles } from './styles';

const TRADE_SKELETON_COLUMNS = [1.2, 0.85, 0.7, 0.95] as const;

function tradeKey(trade: TradeMessage) {
  // Prefer app-stamped id (`productId_seq`); fall back for any unstamped edge case.
  return trade.id ?? `${trade.timestamp}-${trade.price}-${trade.size}-${trade.buyer_role}`;
}

function keyExtractor(item: TradeMessage) {
  return tradeKey(item);
}

export function RecentTradesPanel({ trades }: { trades: TradeMessage[] }) {
  const seededRef = useRef(false);
  const lastTopKeyRef = useRef<string | null>(null);
  const [flashKey, setFlashKey] = useState<string | null>(null);

  useEffect(() => {
    const top = trades[0];
    if (!top) return;

    const key = tradeKey(top);

    // First non-empty paint: seed silently (no flash storm on open).
    if (!seededRef.current) {
      seededRef.current = true;
      lastTopKeyRef.current = key;
      return;
    }

    if (key !== lastTopKeyRef.current) {
      lastTopKeyRef.current = key;
      setFlashKey(key);
    }
  }, [trades]);

  const renderTrade = useCallback(
    ({ item, index }: { item: TradeMessage; index: number }) => (
      <TradeRow
        highlight={index === 0 && flashKey === tradeKey(item)}
        trade={item}
      />
    ),
    [flashKey],
  );

  return (
    <View style={styles.tradesPane}>
      <Text style={styles.tradesTitle}>{i18.recentTradesTitle}</Text>
      <View style={styles.tradeLabels}>
        <Text style={[styles.tradeLabel, styles.tradePrice]}>{i18.columnPrice}</Text>
        <Text style={[styles.tradeLabel, styles.tradeSize]}>{i18.columnSize}</Text>
        <Text style={[styles.tradeLabel, styles.tradeSide]}>{i18.columnSide}</Text>
        <Text style={[styles.tradeLabel, styles.tradeTime]}>{i18.columnTime}</Text>
      </View>
      {trades.length === 0 ? (
        <SkeletonRows
          columns={TRADE_SKELETON_COLUMNS}
          count={10}
          rowHeight={TRADE_ROW_HEIGHT}
          style={styles.tradesList}
        />
      ) : (
        <FlashList
          data={trades}
          extraData={flashKey}
          keyExtractor={keyExtractor}
          maintainVisibleContentPosition={{ autoscrollToTopThreshold: 0 }}
          renderItem={renderTrade}
          style={styles.tradesList}
        />
      )}
    </View>
  );
}
