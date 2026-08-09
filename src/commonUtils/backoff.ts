import { MAX_RETRY_DELAY_MS } from './marketConstants';

export interface ExponentialBackoffOptions {
  /** Delay for attempt 0. Default 1000. */
  baseMs?: number;
  /** Cap. Default MAX_RETRY_DELAY_MS. */
  maxMs?: number;
}

/**
 * Generic exponential backoff: min(baseMs * 2^attempt, maxMs).
 * Pure helper — transport / any retry loop can reuse it.
 */
export function exponentialBackoffMs(
  attempt: number,
  options: ExponentialBackoffOptions = {},
): number {
  const baseMs = options.baseMs ?? 1_000;
  const maxMs = options.maxMs ?? MAX_RETRY_DELAY_MS;
  const safeAttempt = Math.max(0, Math.floor(attempt));
  return Math.min(baseMs * 2 ** safeAttempt, maxMs);
}
