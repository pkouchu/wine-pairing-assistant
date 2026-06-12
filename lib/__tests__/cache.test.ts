// lib/__tests__/cache.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCache } from '../cache';

beforeEach(() => {
  vi.useRealTimers();
});

describe('createCache', () => {
  it('returns undefined before any value is set', () => {
    const cache = createCache<string>(1000);
    expect(cache.get()).toBeUndefined();
  });

  it('returns a set value within TTL', () => {
    vi.useFakeTimers();
    const cache = createCache<string>(60_000);
    cache.set('hello');
    vi.advanceTimersByTime(30_000);
    expect(cache.get()).toBe('hello');
  });

  it('returns undefined after TTL expires', () => {
    vi.useFakeTimers();
    const cache = createCache<string>(60_000);
    cache.set('hello');
    vi.advanceTimersByTime(60_001);
    expect(cache.get()).toBeUndefined();
  });

  it('invalidate clears the cached value', () => {
    const cache = createCache<string>(60_000);
    cache.set('hello');
    cache.invalidate();
    expect(cache.get()).toBeUndefined();
  });

  it('set overwrites a previous value and resets TTL', () => {
    vi.useFakeTimers();
    const cache = createCache<string>(60_000);
    cache.set('first');
    vi.advanceTimersByTime(50_000);
    cache.set('second');
    vi.advanceTimersByTime(30_000);
    expect(cache.get()).toBe('second');
  });
});
