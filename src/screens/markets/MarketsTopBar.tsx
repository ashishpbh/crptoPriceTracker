import { useCallback } from 'react';
import { Text, TextInput, View } from 'react-native';

import { marketRepository } from '@/api/marketRepository';
import { ConnectionStatusBadge } from '@/components/connectionStatus';
import { colors } from '@/constants/colors';
import { i18 } from '@/i18';
import {
  selectConnectionStatus,
  selectReconnectAttempt,
} from '@/selectors/marketSelectors';
import { useMarketStore } from '@/stores/marketStore';

import { marketsStyles as styles } from './styles';

/** Owns connection status so list tree is not re-rendered on connect/reconnect. */
export function MarketsTopBar({
  query,
  onChangeQuery,
}: {
  query: string;
  onChangeQuery: (value: string) => void;
}) {
  const status = useMarketStore(selectConnectionStatus);
  const attempt = useMarketStore(selectReconnectAttempt);
  const onRetry = useCallback(() => marketRepository.reconnect(), []);

  return (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>{i18.marketsEyebrow}</Text>
          <Text style={styles.title}>{i18.marketsTitle}</Text>
        </View>
        <ConnectionStatusBadge attempt={attempt} onRetry={onRetry} status={status} />
      </View>
      <View style={styles.searchWrap}>
        <TextInput
          autoCapitalize="characters"
          onChangeText={onChangeQuery}
          placeholder={i18.searchPlaceholder}
          placeholderTextColor={colors.star}
          style={styles.search}
          value={query}
        />
      </View>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{i18.productColumn}</Text>
        <Text style={styles.sectionLabel}>{i18.priceColumn}</Text>
      </View>
    </>
  );
}
