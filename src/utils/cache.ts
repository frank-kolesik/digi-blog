import { LRUCache } from 'lru-cache';

declare global {
  var markdownCache: LRUCache<string, any>;
}

let markdownCache =
  global.markdownCache ||
  (global.markdownCache = new LRUCache<string, any>({
    max: 300,
    ttl: process.env.NODE_ENV === 'production' ? 1 : 1000 * 60 * 1,
  }));

export const fetchCached = async <T>(opts: {
  fn: () => Promise<T>;
  key: string;
  ttl: number;
}): Promise<T> => {
  if (markdownCache.has(opts.key)) {
    return markdownCache.get(opts.key) as T;
  }

  const result = await opts.fn();

  markdownCache.set(opts.key, result, {
    ttl: opts.ttl,
  });

  return result;
};
