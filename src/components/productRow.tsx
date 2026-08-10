import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PRODUCT_ROW_HEIGHT, type Symbol, type TickerMessage } from '@/commonUtils';
import { colors } from '@/constants/colors';
import { i18 } from '@/i18';
import { changeFromTickerRatio, formatPercent, formatPrice } from '@/utils/format';

interface ProductRowProps {
  symbol: Symbol;
  ticker?: TickerMessage;
  isFavorite: boolean;
  onPress: (symbol: Symbol) => void;
  onToggleFavorite: (symbol: Symbol) => void;
}

function ProductRowComponent({
  symbol,
  ticker,
  isFavorite,
  onPress,
  onToggleFavorite,
}: ProductRowProps) {
  const change = ticker ? changeFromTickerRatio(ticker.ltp_change_24h) : 0;
  const positive = change >= 0;

  const handlePress = useCallback(() => onPress(symbol), [onPress, symbol]);
  const handleToggleFavorite = useCallback(
    () => onToggleFavorite(symbol),
    [onToggleFavorite, symbol],
  );

  return (
    <Pressable accessibilityRole="button" onPress={handlePress} style={styles.row}>
      <View style={styles.symbolBlock}>
        <View style={styles.coin}>
          <Text style={styles.coinText}>{symbol.slice(0, 1)}</Text>
        </View>
        <View>
          <Text style={styles.symbol}>{symbol.replace('USD', '')}</Text>
          <Text style={styles.quote}>{i18.quotePerpetual}</Text>
        </View>
      </View>
      <View style={styles.priceBlock}>
        <Text style={styles.price}>{ticker ? formatPrice(ticker.close) : '—'}</Text>
        <Text style={[styles.change, positive ? styles.positive : styles.negative]}>
          {ticker ? formatPercent(change) : i18.waitingForPrice}
        </Text>
      </View>
      <Pressable
        accessibilityLabel={`Toggle ${symbol} favorite`}
        hitSlop={12}
        onPress={handleToggleFavorite}
        style={styles.favorite}>
        <Text style={[styles.star, isFavorite && styles.starActive]}>
          {isFavorite ? '★' : '☆'}
        </Text>
      </Pressable>
    </Pressable>
  );
}

export const ProductRow = memo(ProductRowComponent);

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    borderBottomColor: colors.marketsBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: PRODUCT_ROW_HEIGHT,
    paddingHorizontal: 20,
  },
  symbolBlock: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 11 },
  coin: {
    alignItems: 'center',
    backgroundColor: colors.marketsCoinBg,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  coinText: { color: colors.marketsCoinText, fontSize: 15, fontWeight: '800' },
  symbol: { color: colors.marketsText, fontSize: 16, fontWeight: '700' },
  quote: { color: colors.marketsMuted, fontSize: 12, marginTop: 2 },
  priceBlock: { alignItems: 'flex-end', marginRight: 16 },
  price: {
    color: colors.marketsText,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
  change: { fontSize: 12, fontVariant: ['tabular-nums'], fontWeight: '700', marginTop: 3 },
  positive: { color: colors.changeUpLight },
  negative: { color: colors.changeDownLight },
  favorite: { padding: 4 },
  star: { color: colors.starInactiveLight, fontSize: 24 },
  starActive: { color: colors.starActiveLight },
});
