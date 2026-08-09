import { StyleSheet, Text, View } from 'react-native';

import type { TickerMessage } from '@/commonUtils';
import { colors } from '@/constants/colors';
import { i18 } from '@/i18';
import { formatCompactNumber, formatPrice } from '@/utils/format';

export function MarketMetrics({ ticker }: { ticker?: TickerMessage }) {
  const items: [string, string][] = [
    [i18.metricMark, ticker ? `$${formatPrice(Number(ticker.mark_price))}` : '—'],
    [i18.metricHigh, ticker ? `$${formatPrice(ticker.high)}` : '—'],
    [i18.metricLow, ticker ? `$${formatPrice(ticker.low)}` : '—'],
    [i18.metricVolume, ticker ? formatCompactNumber(ticker.volume) : '—'],
    [
      i18.metricFunding,
      ticker ? `${(Number(ticker.funding_rate) * 100).toFixed(2)}%` : '—',
    ],
  ];

  return (
    <View style={styles.row}>
      {items.map(([label, value]) => (
        <View key={label} style={styles.item}>
          <Text style={styles.label}>{label}</Text>
          <Text numberOfLines={1} style={styles.value}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomColor: colors.detailBorder,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  item: { flex: 1, paddingRight: 6 },
  label: { color: colors.detailLabel, fontSize: 11, fontWeight: '600', marginBottom: 6 },
  value: {
    color: colors.detailValue,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
  },
});
