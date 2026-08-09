import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { Text, View } from 'react-native';

import type { TradeMessage } from '@/commonUtils';
import { TradeRow } from '@/components/tradeRow';
import { i18 } from '@/i18';

import { productDetailStyles as styles } from './styles';

function keyExtractor(item: TradeMessage) {
  return `${item.timestamp}-${item.price}-${item.size}`;
}

export function RecentTradesPanel({ trades }: { trades: TradeMessage[] }) {
  const renderTrade = useCallback(
    ({ item }: { item: TradeMessage }) => <TradeRow trade={item} />,
    [],
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
      <FlashList
        data={trades}
        keyExtractor={keyExtractor}
        ListEmptyComponent={
          <Text style={styles.emptyTrades}>{i18.waitingForTrades}</Text>
        }
        renderItem={renderTrade}
        style={styles.tradesList}
      />
    </View>
  );
}
