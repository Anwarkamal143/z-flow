import { APP_CONFIG } from "@/config/app.config";
import { toUTC } from "@/utils/date-time";
import { createRedisKey } from "@/utils/redis";
import Redis, { RedisKey } from "ioredis";
import { logger } from "./logger";

class IoRedis extends Redis {
  private static _redis: Redis;

  constructor() {
    super({
      port: APP_CONFIG.REDIS_PORT!,
      host: APP_CONFIG.REDIS_HOST!,
      password: APP_CONFIG.REDIS_PASSWORD!,

      retryStrategy(times) {
        if (times > 3) {
          logger.error("Redis connection failed after 3 retries.");
          return null;
        }

        const delay = Math.min(times * 100, 3000);
        logger.warn(`Retrying Redis in ${delay}ms`);
        return delay;
      },

      reconnectOnError(err: any) {
        const msgList = ["READONLY", "ETIMEDOUT"];
        const shouldReconnect = msgList.some((msg) =>
          err.message.includes(msg)
        );

        if (shouldReconnect) {
          logger.warn("Reconnecting Redis due to error:", err);
        }

        return shouldReconnect;
      },
    });
  }

  static connect() {
    if (!this._redis) {
      try {
        this._redis = new IoRedis();

        this._redis.on("connect", () => {
          logger.info("Redis connected at ", toUTC(new Date()));
        });

        this._redis.on("error", (err: any) => {
          logger.error("Redis error:", err);
        });

        this._redis.on("reconnecting", () => {
          logger.warn("Redis reconnecting...");
        });
      } catch (error: any) {
        logger.error("Redis connection failed:", error);
      }
    }
    return this._redis;
  }

  // Utility methods
  static async setValue(key: string, value: any, ttl?: number) {
    try {
      const redisKey = createRedisKey(key);
      if (ttl) return await this._redis.set(redisKey, value, "EX", ttl);
      return await this._redis.set(redisKey, value);
    } catch (err: any) {
      logger.error("Redis setValue error:", err);
      return null;
    }
  }

  static async getValue(key: RedisKey) {
    try {
      return await this._redis.get(createRedisKey(key as string));
    } catch (err: any) {
      logger.error("Redis getValue error:", err);
      return null;
    }
  }

  static async getJson<T = any>(key: string): Promise<T | null> {
    const raw = await this.getValue(key);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (err) {
      logger.error("Failed to parse JSON from Redis");
      return null;
    }
  }

  static async delValue(key: RedisKey) {
    try {
      return await this._redis.del(createRedisKey(key as string));
    } catch (err: any) {
      logger.error("Redis delValue error:", err);
      return null;
    }
  }

  static async publish(channel: string, message: any) {
    try {
      const msg =
        typeof message === "string" || Buffer.isBuffer(message)
          ? message
          : JSON.stringify(message);

      return await this._redis.publish(channel, msg);
    } catch (err: any) {
      logger.error("Redis publish error:", err);
      return null;
    }
  }

  static async close() {
    try {
      logger.warn("Closing Redis connection at " + toUTC(new Date()));
      await this._redis.quit();
    } catch (err: any) {
      logger.error("Error closing Redis:", err);
    }
  }
}

export default IoRedis;
