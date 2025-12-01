// utils/cache.ts
import { createRedisKey } from "@/utils/redis";
import { Redis } from "ioredis";

type CacheOptions = {
  ttl?: number;
  useCache?: boolean;
};

export async function cache<T>(
  redis: Redis,
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = { useCache: true }
): Promise<T> {
  const redisKey = createRedisKey(key);

  if (options.useCache) {
    const cached = await redis.get(redisKey);
    if (cached) {
      console.log("Cache hit:", redisKey);
      return JSON.parse(cached) as T;
    }
  }

  const result = await fetcher();

  if (options.useCache) {
    if (options.ttl) {
      await redis.set(redisKey, JSON.stringify(result), "EX", options.ttl);
    } else {
      await redis.set(redisKey, JSON.stringify(result));
    }
  }

  return result;
}
