import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/constants/colors';

type SkeletonRowsProps = {
  /** Number of placeholder rows. */
  count: number;
  rowHeight: number;
  /** Flex weights per bone (left → right). */
  columns: readonly number[];
  style?: StyleProp<ViewStyle>;
};

/** Generic row of muted bones — used by orderbook / trades loading panes. */
export function SkeletonRows({ count, rowHeight, columns, style }: SkeletonRowsProps) {
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={[styles.row, { height: rowHeight }]}>
          {columns.map((flex, columnIndex) => (
            <View
              key={columnIndex}
              style={[
                styles.bone,
                {
                  flex,
                  marginRight: columnIndex < columns.length - 1 ? 6 : 0,
                },
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, minHeight: 0 },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  bone: {
    backgroundColor: colors.detailSpreadBg,
    borderRadius: 3,
    height: 10,
  },
});
