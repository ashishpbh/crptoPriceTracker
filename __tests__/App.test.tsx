/**
 * @format
 */

import { changeFromTickerRatio, formatPercent, normalizeSearchQuery } from '../src/utils/format';

test('changeFromTickerRatio converts ratio to percent', () => {
  expect(changeFromTickerRatio('1.025')).toBeCloseTo(2.5);
  expect(changeFromTickerRatio('0.99')).toBeCloseTo(-1);
});

test('formatPercent includes sign', () => {
  expect(formatPercent(2.5)).toBe('+2.50%');
  expect(formatPercent(-1.2)).toBe('-1.20%');
});

test('normalizeSearchQuery uppercases and trims', () => {
  expect(normalizeSearchQuery('  btc ')).toBe('BTC');
});
