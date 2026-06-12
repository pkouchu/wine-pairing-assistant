// lib/cache.ts
type Cache<T> = {
  get: () => T | undefined;
  set: (value: T) => void;
  invalidate: () => void;
};

export function createCache<T>(ttlMs: number): Cache<T> {
  let value: T | undefined;
  let expiresAt: number | undefined;

  return {
    get() {
      if (value === undefined || expiresAt === undefined) return undefined;
      if (Date.now() > expiresAt) {
        value = undefined;
        expiresAt = undefined;
        return undefined;
      }
      return value;
    },
    set(v: T) {
      value = v;
      expiresAt = Date.now() + ttlMs;
    },
    invalidate() {
      value = undefined;
      expiresAt = undefined;
    },
  };
}
