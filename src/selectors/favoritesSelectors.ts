import type { Symbol } from '@/commonUtils';
import type { useFavoritesStore } from '@/stores/favoritesStore';

type FavoritesState = ReturnType<typeof useFavoritesStore.getState>;

export const selectFavoriteSymbols = (state: FavoritesState): Symbol[] => state.symbols;

export const selectIsFavorite =
  (symbol: Symbol) =>
  (state: FavoritesState): boolean =>
    state.symbols.includes(symbol);

export const selectToggleFavorite = (state: FavoritesState) => state.toggle;
