import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { SCREEN } from './screenNames';

export type RootStackParamList = {
  [SCREEN.MARKETS]: undefined;
  [SCREEN.FAVORITES]: undefined;
  [SCREEN.PRODUCT_DETAIL]: { symbol: string };
};

export type MarketsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof SCREEN.MARKETS
>;
export type FavoritesScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof SCREEN.FAVORITES
>;
export type ProductDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof SCREEN.PRODUCT_DETAIL
>;
