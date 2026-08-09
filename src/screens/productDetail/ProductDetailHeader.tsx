import { Pressable, Text, View } from 'react-native';

import type { Symbol } from '@/commonUtils';
import { i18 } from '@/i18';

import { productDetailStyles as styles } from './styles';

export function ProductDetailHeader({
  symbol,
  isFavorite,
  onBack,
  onToggleFavorite,
}: {
  symbol: Symbol;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBack}
        style={styles.backBtn}>
        <Text style={styles.backChevron}>‹</Text>
        <Text style={styles.backLabel}>{i18.back}</Text>
      </Pressable>
      <View style={styles.headerCenter}>
        <Text style={styles.symbol}>{symbol}</Text>
        <Text style={styles.productName}>{i18.productNames[symbol]}</Text>
      </View>
      <Pressable
        accessibilityLabel="Toggle favorite"
        hitSlop={8}
        onPress={onToggleFavorite}>
        <Text style={[styles.star, isFavorite && styles.starActive]}>
          {isFavorite ? '★' : '☆'}
        </Text>
      </Pressable>
    </View>
  );
}
