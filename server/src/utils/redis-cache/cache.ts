// utils/cache.ts
import crypto from "crypto";
import Redis from "ioredis";

export type CacheOptions = {
  ttl?: number; // seconds
  useCache?: boolean; // enable/disable
  staleWhileRevalidate?: boolean; // optional SWR mode
  namespace?: string; // prefix grouping
};

// Hash long keys so Redis keys stay clean
const hashKey = (key: string) =>
  crypto.createHash("sha1").update(key).digest("hex");

const buildKey = (namespace: string | undefined, key: string) => {
  const hashed = hashKey(key);
  return namespace ? `${namespace}:${hashed}` : hashed;
};

export async function cache<T>(
  redis: Redis,
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const {
    ttl,
    useCache = true,
    staleWhileRevalidate = false,
    namespace,
  } = options;

  const redisKey = buildKey(namespace, key);

  if (useCache) {
    const cached = await redis.get(redisKey);

    if (cached) {
      const parsed = JSON.parse(cached) as T;

      // 🚀 Stale While Revalidate
      if (staleWhileRevalidate && ttl) {
        redis.expire(redisKey, ttl); // Refresh TTL in background
      }

      return parsed;
    }
  }

  // Missing or disabled → fetch fresh data
  try {
    let result = (await fetcher()) as any;
    if (result?.data) {
      result = result.data as T;
    }
    if (useCache) {
      const json = JSON.stringify(result);

      ttl
        ? await redis.set(redisKey, json, "EX", ttl)
        : await redis.set(redisKey, json);
    }
    return result as T;
  } catch (error) {
    return null as unknown as T;
  }
}
