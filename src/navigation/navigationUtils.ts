import type { NavigationProp } from '@react-navigation/native';

import { SCREEN } from './screenNames';
import type { RootStackParamList } from './types';

type RootNavigate = NavigationProp<RootStackParamList>['navigate'];

type WithNavigate = {
  navigate: RootNavigate;
};

export function navigateToMarkets(navigation: WithNavigate) {
  navigation.navigate(SCREEN.MARKETS);
}

export function navigateToFavorites(navigation: WithNavigate) {
  navigation.navigate(SCREEN.FAVORITES);
}

export function navigateToProductDetail(navigation: WithNavigate, symbol: string) {
  navigation.navigate(SCREEN.PRODUCT_DETAIL, { symbol });
}

export function navigateBack(navigation: { goBack: () => void }) {
  navigation.goBack();
}
