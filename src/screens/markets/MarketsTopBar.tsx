import { Text, TextInput, View } from 'react-native';

import type { ConnectionStatus } from '@/commonUtils';
import { ConnectionStatusBadge } from '@/components/connectionStatus';
import { colors } from '@/constants/colors';
import { i18 } from '@/i18';

import { marketsStyles as styles } from './styles';

export function MarketsTopBar({
  status,
  attempt = 0,
  onRetry,
  query,
  onChangeQuery,
}: {
  status: ConnectionStatus;
  attempt?: number;
  onRetry?: () => void;
  query: string;
  onChangeQuery: (value: string) => void;
}) {
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
