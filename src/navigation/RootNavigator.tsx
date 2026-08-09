import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FavoritesScreen } from '@/screens/favorites';
import { MarketsScreen } from '@/screens/markets';
import { ProductDetailScreen } from '@/screens/productDetail';
import { colors } from '@/constants/colors';
import { SCREEN } from './screenNames';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.detailBg,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={SCREEN.MARKETS} component={MarketsScreen} />
        <Stack.Screen name={SCREEN.FAVORITES} component={FavoritesScreen} />
        <Stack.Screen name={SCREEN.PRODUCT_DETAIL} component={ProductDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
