import { Text, View } from 'react-native';

import type { TickerMessage } from '@/commonUtils';
import { changeFromTickerRatio, formatPercent, formatPrice } from '@/utils/format';

import { productDetailStyles as styles } from './styles';

export function ProductPriceBlock({ ticker }: { ticker?: TickerMessage }) {
  const change = ticker ? changeFromTickerRatio(ticker.ltp_change_24h) : 0;

  return (
    <View style={styles.priceBlock}>
      <Text style={styles.lastPrice}>
        {ticker ? `$${formatPrice(ticker.close)}` : '—'}
      </Text>
      <Text
        style={[styles.change, change >= 0 ? styles.positive : styles.negative]}>
        {ticker ? formatPercent(change) : ''}
      </Text>
    </View>
  );
}
