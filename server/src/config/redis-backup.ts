import { APP_CONFIG } from "@/config/app.config";
import { toUTC } from "@/utils/date-time";
import { createRedisKey } from "@/utils/redis";
import Redis, { RedisOptions } from "ioredis";
import { logger } from "./logger";

// Configuration interface - only include properties we actually use
interface RedisClientConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  maxRetries?: number;
  retryStrategy?: (times: number) => number | null | void;
  reconnectOnError?: (err: Error) => boolean;
  enableReadyCheck?: boolean;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
}

// Default configuration values
const DEFAULT_CONFIG: RedisClientConfig = {
  host: APP_CONFIG.REDIS_HOST || "localhost",
  port: APP_CONFIG.REDIS_PORT || 6379,
  password: APP_CONFIG.REDIS_PASSWORD || "",
  db: 0,
  keyPrefix: APP_CONFIG.REDIS_KEY_PREFIX || "",
  maxRetries: 3,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  lazyConnect: false,
};

class RedisClient {
  private client: Redis | null = null;
  private config: RedisClientConfig;
  private metrics = {
    operations: 0,
    errors: 0,
    latency: [] as number[],
  };
  private static instance: RedisClient;
  private healthCheckInterval?: NodeJS.Timeout;

  private constructor(config?: RedisClientConfig) {
    this.config = this.mergeConfig(config);
  }

  public get _client() {
    return this.client;
  }

  public static getInstance(config?: RedisClientConfig): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient(config);
    }
    return RedisClient.instance;
  }

  private mergeConfig(config?: RedisClientConfig): RedisClientConfig {
    const merged = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Add retry strategy if not provided
    if (!merged.retryStrategy) {
      merged.retryStrategy = (times) => {
        if (times > (merged.maxRetries || 3)) {
          logger.error(
            `Redis connection failed after ${merged.maxRetries} retries`
          );
          return null;
        }
        const delay = Math.min(times * 100, 3000);
        logger.warn(`Retrying Redis in ${delay}ms (attempt ${times})`);
        return delay;
      };
    }

    // Add reconnect on error if not provided
    if (!merged.reconnectOnError) {
      merged.reconnectOnError = (err) => {
        const reconnectErrors = [
          "READONLY",
          "ETIMEDOUT",
          "ECONNREFUSED",
          "ECONNRESET",
        ];
        const shouldReconnect = reconnectErrors.some((msg) =>
          err.message.includes(msg)
        );

        if (shouldReconnect) {
          logger.warn(`Redis reconnecting due to: ${err.message}`);
        }
        return shouldReconnect;
      };
    }

    return merged;
  }

  private getRedisOptions(): RedisOptions {
    return {
      host: this.config.host!,
      port: this.config.port!,
      password: this.config.password || undefined,
      db: this.config.db!,
      keyPrefix: this.config.keyPrefix!,
      retryStrategy: this.config.retryStrategy,
      reconnectOnError: this.config.reconnectOnError,
      enableReadyCheck: this.config.enableReadyCheck,
      maxRetriesPerRequest: this.config.maxRetriesPerRequest,
      lazyConnect: this.config.lazyConnect,
    };
  }

  public async connect(): Promise<void> {
    if (this.client && this.client.status === "ready") {
      logger.warn("Redis already connected");
      return;
    }

    try {
      this.client = new Redis(this.getRedisOptions());

      this.setupEventListeners();

      if (!this.config.lazyConnect) {
        await this.client.connect();
      }

      this.startHealthChecks();
      logger.info("Redis connected successfully", {
        host: this.config.host,
        port: this.config.port,
      });
    } catch (error) {
      logger.error("Failed to connect to Redis:", error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.client) return;

    this.client.on("connect", () => {
      logger.info("Redis connected at " + toUTC(new Date()));
    });

    this.client.on("ready", () => {
      logger.info("Redis ready");
    });

    this.client.on("error", (error) => {
      this.metrics.errors++;
      logger.error("Redis error:", error);
    });

    this.client.on("close", () => {
      logger.warn("Redis connection closed");
    });

    this.client.on("reconnecting", (delay) => {
      logger.warn(`Redis reconnecting in ${delay}ms`);
    });

    this.client.on("end", () => {
      logger.warn("Redis connection ended");
    });
  }

  private startHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        if (this.client) {
          await this.client.ping();
        }
      } catch (error) {
        logger.error("Redis health check failed:", error);
      }
    }, 30000);
  }

  // Core methods with error handling and metrics
  private async execute<T>(
    operation: string,
    fn: () => Promise<T>,
    fallback?: T
  ): Promise<T | null> {
    const startTime = Date.now();

    try {
      if (!this.client || this.client.status !== "ready") {
        throw new Error("Redis client not ready");
      }

      const result = await fn();
      const latency = Date.now() - startTime;

      this.metrics.operations++;
      this.metrics.latency.push(latency);

      // Keep only last 1000 latency measurements
      if (this.metrics.latency.length > 1000) {
        this.metrics.latency.shift();
      }

      return result;
    } catch (error) {
      this.metrics.errors++;
      logger.error(`Redis ${operation} failed:`, error);

      if (fallback !== undefined) {
        return fallback;
      }
      return null;
    }
  }

  // Key-value operations
  public async set(key: string, value: any, ttl?: number): Promise<boolean> {
    const redisKey = createRedisKey(key);
    const valueToStore =
      typeof value === "string" ? value : JSON.stringify(value);

    const result = await this.execute("set", async () => {
      if (ttl) {
        return await this.client!.set(redisKey, valueToStore, "EX", ttl);
      }
      return await this.client!.set(redisKey, valueToStore);
    });

    return result === "OK";
  }

  public async get<T = any>(key: string): Promise<T | null> {
    const redisKey = createRedisKey(key);

    const result = await this.execute("get", async () => {
      return await this.client!.get(redisKey);
    });

    if (!result) return null;

    try {
      return JSON.parse(result) as T;
    } catch {
      return result as unknown as T;
    }
  }

  public async getString(key: string): Promise<string | null> {
    const redisKey = createRedisKey(key);
    return await this.execute("get", async () => {
      return await this.client!.get(redisKey);
    });
  }

  public async del(key: string | string[]): Promise<number | null> {
    const keys = Array.isArray(key)
      ? key.map((k) => createRedisKey(k))
      : [createRedisKey(key)];

    return await this.execute(
      "del",
      async () => {
        return await this.client!.del(...keys);
      },
      0
    );
  }

  public async remove(key: string, batchSize = 500): Promise<void> {
    let cursor = "0";

    do {
      const scanResult = await this.execute("remove", async () => {
        return await this.client!.scan(
          cursor,
          "MATCH",
          key,
          "COUNT",
          batchSize
        );
      });
      // Handle null result
      if (!scanResult) {
        break;
      }

      const [nextCursor, keys] = scanResult;
      cursor = nextCursor;

      cursor = nextCursor;

      if (keys && keys.length > 0) {
        // Pipeline for performance
        const pipeline = this.client!.pipeline();
        keys.forEach((key) => pipeline.del(key));
        await pipeline.exec();
      }
    } while (cursor !== "0");
  }

  public async exists(key: string): Promise<boolean> {
    const redisKey = createRedisKey(key);
    const result = await this.execute(
      "exists",
      async () => {
        return await this.client!.exists(redisKey);
      },
      0
    );

    return result === 1;
  }

  public async expire(key: string, seconds: number): Promise<boolean> {
    const redisKey = createRedisKey(key);
    const result = await this.execute(
      "expire",
      async () => {
        return await this.client!.expire(redisKey, seconds);
      },
      0
    );

    return result === 1;
  }

  // Hash operations
  public async hset(
    key: string,
    field: string,
    value: any
  ): Promise<number | null> {
    const redisKey = createRedisKey(key);
    const valueToStore =
      typeof value === "string" ? value : JSON.stringify(value);

    return await this.execute(
      "hset",
      async () => {
        return await this.client!.hset(redisKey, field, valueToStore);
      },
      0
    );
  }

  public async hget<T = any>(key: string, field: string): Promise<T | null> {
    const redisKey = createRedisKey(key);

    const result = await this.execute("hget", async () => {
      return await this.client!.hget(redisKey, field);
    });

    if (!result) return null;

    try {
      return JSON.parse(result) as T;
    } catch {
      return result as unknown as T;
    }
  }
  public async hdel(
    key: string,
    ...fields: (string | Buffer<ArrayBufferLike>)[]
  ): Promise<number | null> {
    const redisKey = createRedisKey(key);

    return await this.execute("hdel", async () => {
      return await this.client!.hdel(redisKey, ...fields);
    });
  }

  public async hgetall<T = any>(
    key: string
  ): Promise<Record<string, T> | null> {
    const redisKey = createRedisKey(key);

    const result = await this.execute("hgetall", async () => {
      return await this.client!.hgetall(redisKey);
    });

    if (!result) return null;

    const parsed: Record<string, T> = {};
    for (const [key, value] of Object.entries(result)) {
      try {
        parsed[key] = JSON.parse(value);
      } catch {
        parsed[key] = value as unknown as T;
      }
    }

    return parsed;
  }

  // Set operations
  public async sadd(key: string, ...members: string[]): Promise<number | null> {
    const redisKey = createRedisKey(key);
    return await this.execute(
      "sadd",
      async () => {
        return await this.client!.sadd(redisKey, ...members);
      },
      0
    );
  }

  public async srem(key: string, ...members: string[]): Promise<number | null> {
    const redisKey = createRedisKey(key);
    return await this.execute(
      "srem",
      async () => {
        return await this.client!.srem(redisKey, ...members);
      },
      0
    );
  }

  public async smembers(key: string): Promise<string[] | null> {
    const redisKey = createRedisKey(key);
    return await this.execute(
      "smembers",
      async () => {
        return await this.client!.smembers(redisKey);
      },
      []
    );
  }

  // Pub/Sub
  public async publish(channel: string, message: any): Promise<number | null> {
    const messageToSend =
      typeof message === "string" ? message : JSON.stringify(message);

    return await this.execute(
      "publish",
      async () => {
        return await this.client!.publish(channel, messageToSend);
      },
      0
    );
  }

  // Pipeline support
  public pipeline() {
    if (!this.client) {
      throw new Error("Redis client not connected");
    }
    return this.client.pipeline();
  }

  // Multi/transaction support
  public multi() {
    if (!this.client) {
      throw new Error("Redis client not connected");
    }
    return this.client.multi();
  }

  // Utility methods
  public async ping(): Promise<string> {
    return (
      (await this.execute(
        "ping",
        async () => {
          return await this.client!.ping();
        },
        "PONG"
      )) || "PONG"
    );
  }
  public async keys(key?: string): Promise<string[] | null> {
    if (!key) {
      return null;
    }
    return await this.execute("keys", async () => {
      return await this.client!.keys(key);
    });
  }

  public async flushdb(): Promise<boolean> {
    if (process.env.NODE_ENV === "production") {
      logger.error("flushdb called in production - prevented");
      return false;
    }

    const result = await this.execute("flushdb", async () => {
      return await this.client!.flushdb();
    });

    return result === "OK";
  }

  // Health and status
  public isConnected(): boolean {
    return this.client?.status === "ready";
  }

  public async getHealth(): Promise<{
    connected: boolean;
    latency: number;
    operations: number;
    errors: number;
    avgLatency: number;
  }> {
    const avgLatency =
      this.metrics.latency.length > 0
        ? this.metrics.latency.reduce((a, b) => a + b, 0) /
          this.metrics.latency.length
        : 0;

    return {
      connected: this.isConnected(),
      latency: await this.measureLatency(),
      operations: this.metrics.operations,
      errors: this.metrics.errors,
      avgLatency,
    };
  }

  private async measureLatency(): Promise<number> {
    const startTime = Date.now();
    try {
      await this.ping();
      return Date.now() - startTime;
    } catch {
      return -1;
    }
  }

  public getMetrics() {
    return { ...this.metrics };
  }

  // Graceful shutdown
  public async disconnect(): Promise<void> {
    logger.info("Disconnecting Redis client");

    // Stop health checks
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.client) {
      try {
        await this.client.quit();
        logger.info("Redis disconnected gracefully");
      } catch (error) {
        logger.error("Error during Redis disconnect:", error);
        try {
          await this.client.disconnect();
        } catch (disconnectError) {
          logger.error("Error during Redis force disconnect:", disconnectError);
        }
      } finally {
        this.client = null;
      }
    }
  }
}

// Export singleton instance for convenience
export const redisClient = RedisClient.getInstance();

// Helper functions
export const RedisHelpers = {
  // Cache with TTL
  async cache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    const cached = await redisClient.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    await redisClient.set(key, data, ttl);
    return data;
  },

  // Distributed lock
  async lock(
    key: string,
    ttl: number = 5000,
    retryDelay: number = 100,
    maxRetries: number = 10
  ): Promise<string | null> {
    const lockId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const lockKey = `lock:${key}`;

    for (let i = 0; i < maxRetries; i++) {
      const acquired = await redisClient.set(lockKey, lockId, ttl);
      if (acquired) {
        return lockId;
      }

      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }

    return null;
  },

  async unlock(key: string, lockId: string): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const currentLockId = await redisClient.getString(lockKey);

    if (currentLockId === lockId) {
      await redisClient.del(lockKey);
      return true;
    }

    return false;
  },

  // Rate limiting
  async rateLimit(
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; reset: number }> {
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;
    const rateKey = `rate:${key}`;

    const pipeline = redisClient
      .pipeline()
      .zremrangebyscore(rateKey, 0, windowStart)
      .zadd(rateKey, now, now.toString())
      .zcard(rateKey)
      .expire(rateKey, windowSeconds * 2);

    const results = await pipeline.exec();
    const count = (results?.[2]?.[1] as number) || 0;

    if (count >= limit) {
      const oldestResult = await redisClient.get<string>(`${rateKey}:oldest`);
      const oldest = oldestResult ? parseInt(oldestResult, 10) : now;
      const reset = Math.ceil((oldest + windowSeconds * 1000 - now) / 1000);

      return {
        allowed: false,
        remaining: 0,
        reset: Math.max(0, reset),
      };
    }

    return {
      allowed: true,
      remaining: limit - count - 1,
      reset: windowSeconds,
    };
  },

  async keys(key?: string) {
    return await redisClient.keys(key);
  },

  async del(key: string, batchSize = 2000) {
    return await redisClient.remove(key, batchSize);
  },
};

export default RedisClient;
