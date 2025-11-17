// utils/cache.ts

import { HTTPSTATUS } from "@/config/http.config";
import fastify from "@/server";
import { createRedisKey } from "@/utils/redis";
import { RedisOptions } from "ioredis";

type CacheOptions = RedisOptions & {
  ttl?: number; // in seconds
  useCache?: boolean;
};

export async function cache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
): Promise<T> {
  if (options?.useCache) {
    // 1. Try cache
    const cached = await fastify.redis.get(createRedisKey(key));
    if (cached) {
      console.log("Cache hit", createRedisKey(key));
      return {
        data: JSON.parse(cached),
        error: null,
        status: HTTPSTATUS.OK,
      } as T;
    }
  }

  // 2. Run query
  const result = (await fetcher()) as {
    data: any;
    error: any;
    status?: number;
  };

  if (options?.useCache && result?.data) {
    // 3. Save to cache
    if (options?.ttl) {
      await fastify.redis.set(
        createRedisKey(key),
        JSON.stringify(result.data),
        "EX",
        options.ttl
      );
    } else {
      await fastify.redis.set(createRedisKey(key), JSON.stringify(result.data));
    }
  }

  return result as T;
}
