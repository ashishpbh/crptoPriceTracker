/**
 * @format
 */

import { exponentialBackoffMs } from '../src/commonUtils/backoff';
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

test('exponentialBackoffMs doubles then caps', () => {
  expect(exponentialBackoffMs(0)).toBe(1_000);
  expect(exponentialBackoffMs(1)).toBe(2_000);
  expect(exponentialBackoffMs(2)).toBe(4_000);
  expect(exponentialBackoffMs(10, { maxMs: 10_000 })).toBe(10_000);
});
