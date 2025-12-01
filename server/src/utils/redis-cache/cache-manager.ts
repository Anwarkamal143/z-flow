import IoRedis from "@/config/redis";
// utils/cache.manager.ts
import { Redis } from "ioredis";

export class CacheManager {
  private redis: Redis;

  constructor(redis: IoRedis = IoRedis.connect()) {
    this.redis = redis;
  }

  async delete(key: string | string[]) {
    const keys = Array.isArray(key) ? key : [key];
    return this.redis.del(keys);
  }

  async deleteNamespace(namespace: string) {
    const keys = await this.redis.keys(`${namespace}:*`);
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }
}
export default new CacheManager();
