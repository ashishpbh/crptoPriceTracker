import { StyleSheet } from 'react-native';

import { colors } from '@/constants/colors';

export const orderBookStyles = StyleSheet.create({
  panel: { flex: 1, minWidth: 0, paddingHorizontal: 12, paddingTop: 14 },
  title: { color: colors.detailSecondary, fontSize: 16, fontWeight: '700', marginBottom: 12 },
  columnLabels: { flexDirection: 'row', marginBottom: 4, paddingHorizontal: 4 },
  label: { color: colors.detailMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  colPrice: { flex: 1.15 },
  colSize: { flex: 0.9, textAlign: 'right' },
  colTotal: { flex: 0.95, textAlign: 'right' },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 22,
    overflow: 'hidden',
    paddingHorizontal: 4,
  },
  bar: { bottom: 0, opacity: 0.22, position: 'absolute', right: 0, top: 0 },
  askBar: { backgroundColor: colors.sellSoft },
  bidBar: { backgroundColor: colors.buySoft },
  cell: { fontSize: 11, fontVariant: ['tabular-nums'], fontWeight: '600', zIndex: 1 },
  ask: { color: colors.sell },
  bid: { color: colors.buy },
  muted: { color: colors.detailCellMuted },
  spread: {
    alignItems: 'center',
    backgroundColor: colors.detailSpreadBg,
    borderRadius: 6,
    marginVertical: 6,
    paddingVertical: 7,
  },
  spreadText: { color: colors.detailSpreadText, fontSize: 11, fontWeight: '600' },
  loading: {
    color: colors.detailMuted,
    fontSize: 12,
    paddingVertical: 16,
    textAlign: 'center',
  },
});
