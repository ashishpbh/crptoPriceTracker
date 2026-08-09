import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { TRADE_ROLE, type TradeMessage } from '@/commonUtils';
import { colors } from '@/constants/colors';
import { i18 } from '@/i18';
import { formatPrice, formatTradeTime } from '@/utils/format';

export function TradeRow({ trade }: { trade: TradeMessage }) {
  const isBuy = trade.buyer_role === TRADE_ROLE.TAKER;

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      style={styles.row}>
      <Text style={[styles.price, isBuy ? styles.buy : styles.sell]}>
        {formatPrice(Number(trade.price))}
      </Text>
      <Text style={styles.size}>{Number(trade.size).toFixed(3)}</Text>
      <Text style={[styles.side, isBuy ? styles.buy : styles.sell]}>
        {isBuy ? i18.buy : i18.sell}
      </Text>
      <Text style={styles.time}>{formatTradeTime(trade.timestamp)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 28,
    paddingHorizontal: 4,
  },
  price: { flex: 1.2, fontSize: 11, fontVariant: ['tabular-nums'], fontWeight: '700' },
  size: {
    color: colors.detailCellMuted,
    flex: 0.85,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  side: { flex: 0.7, fontSize: 10, fontWeight: '800', textAlign: 'right' },
  time: {
    color: colors.detailMuted,
    flex: 0.95,
    fontSize: 10,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  buy: { color: colors.buy },
  sell: { color: colors.sell },
});
