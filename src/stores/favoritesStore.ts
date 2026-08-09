import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Symbol } from '@/commonUtils';

interface FavoritesState {
  symbols: Symbol[];
  toggle: (symbol: Symbol) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    set => ({
      symbols: [],
      toggle: symbol =>
        set(state => ({
          symbols: state.symbols.includes(symbol)
            ? state.symbols.filter(item => item !== symbol)
            : [...state.symbols, symbol],
        })),
    }),
    {
      name: 'crypto-price-tracker:favorites',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
