import { Text, View } from 'react-native';

import type { DepthLevel } from '@/commonUtils';
import { formatPrice } from '@/utils/format';

import { orderBookStyles as styles } from './styles';

export function OrderBookDepthRow({
  level,
  maxDepth,
  side,
}: {
  level: DepthLevel;
  maxDepth: number;
  side: 'ask' | 'bid';
}) {
  const width = `${Math.max(4, (level.cumulative / maxDepth) * 100)}%` as `${number}%`;
  const isAsk = side === 'ask';

  return (
    <View style={styles.row}>
      <View style={[styles.bar, isAsk ? styles.askBar : styles.bidBar, { width }]} />
      <Text style={[styles.cell, styles.colPrice, isAsk ? styles.ask : styles.bid]}>
        {formatPrice(level.price)}
      </Text>
      <Text style={[styles.cell, styles.colSize, styles.muted]}>
        {level.quantity.toFixed(3)}
      </Text>
      <Text style={[styles.cell, styles.colTotal, styles.muted]}>
        {level.cumulative.toFixed(3)}
      </Text>
    </View>
  );
}
