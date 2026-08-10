import { StyleSheet, View } from 'react-native';

import {
  ORDERBOOK_ROW_HEIGHT,
  VISIBLE_ORDERBOOK_LEVELS,
} from '@/commonUtils';
import { colors } from '@/constants/colors';

import { SkeletonRows } from './SkeletonRows';

const DEPTH_COLUMNS = [1.15, 0.9, 0.95] as const;

/** Asks + spread + bids placeholders for the orderbook pane. */
export function OrderbookSkeleton() {
  return (
    <View style={styles.wrap}>
      <SkeletonRows
        columns={DEPTH_COLUMNS}
        count={VISIBLE_ORDERBOOK_LEVELS}
        rowHeight={ORDERBOOK_ROW_HEIGHT}
      />
      <View style={styles.spread}>
        <View style={styles.spreadBone} />
      </View>
      <SkeletonRows
        columns={DEPTH_COLUMNS}
        count={VISIBLE_ORDERBOOK_LEVELS}
        rowHeight={ORDERBOOK_ROW_HEIGHT}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minHeight: 0 },
  spread: {
    alignItems: 'center',
    backgroundColor: colors.detailSpreadBg,
    borderRadius: 6,
    marginVertical: 6,
    paddingVertical: 7,
  },
  spreadBone: {
    backgroundColor: colors.detailBorder,
    borderRadius: 3,
    height: 10,
    width: '55%',
  },
});
