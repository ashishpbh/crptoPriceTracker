export const SYMBOLS = ['BTCUSD', 'ETHUSD', 'XRPUSD', 'SOLUSD', 'PAXGUSD', 'DOGEUSD'] as const;

export type Symbol = (typeof SYMBOLS)[number];

export function isSymbol(value: string): value is Symbol {
  return (SYMBOLS as readonly string[]).includes(value);
}
