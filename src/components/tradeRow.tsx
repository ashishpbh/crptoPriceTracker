import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { TRADE_ROLE, type TradeMessage } from '@/commonUtils';
import { colors } from '@/constants/colors';
import { i18 } from '@/i18';
import { formatPrice, formatTradeTime } from '@/utils/format';

const FLASH_MS = 720;

/** Only the newest trade should pass highlight — avoids list-wide splash. */
export function TradeRow({
  trade,
  highlight = false,
}: {
  trade: TradeMessage;
  highlight?: boolean;
}) {
  const isBuy = trade.buyer_role === TRADE_ROLE.TAKER;
  const flash = useSharedValue(0);

  useEffect(() => {
    if (!highlight) {
      flash.value = 0;
      return;
    }
    flash.value = 1;
    flash.value = withTiming(0, { duration: FLASH_MS });
    return () => cancelAnimation(flash);
  }, [flash, highlight, trade.timestamp, trade.price, trade.size]);

  const flashStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      flash.value,
      [0, 1],
      [
        colors.tradeFlashClear,
        isBuy ? colors.tradeFlashBuy : colors.tradeFlashSell,
      ],
    ),
  }));

  return (
    <Animated.View style={[styles.row, flashStyle]}>
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
    borderRadius: 4,
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
