import { APP_CONFIG } from "@/config/app.config";
import fastify from "@/server";
import { parseDurationToSeconds } from "./cookie";
export const REDIS_KEYS = {
  REFRESH_TOKEN_JTI: (jti?: string) =>
    createRedisKey("refresh-token-jit" + jti),
};
export const createRedisKey = (key: string) => {
  return `${APP_CONFIG.REDIS_PREFIX}:${key}`;
};
export const getRefreshTokenByJTI = async (jti?: string) => {
  if (!jti) {
    return null;
  }
  const jtires = await fastify.redis.get(REDIS_KEYS.REFRESH_TOKEN_JTI(jti));
  if (!jtires) {
    return null;
  }

  return JSON.parse(jtires) as IStoredRefreshToken;
};
export const setRefreshTokenWithJTI = async (
  jti?: string,
  text?: IStoredRefreshToken
) => {
  if (!jti || !text) {
    return null;
  }
  return await fastify.redis.setex(
    REDIS_KEYS.REFRESH_TOKEN_JTI(jti),
    parseDurationToSeconds(APP_CONFIG.JWT_REFRESH_EXPIRES_IN || "7d"),
    JSON.stringify(text)
  );
};
export const deleteRefreshTokenWithJTI = async (jti?: string) => {
  if (!jti) {
    return null;
  }

  return await fastify.redis.del(REDIS_KEYS.REFRESH_TOKEN_JTI(jti));
};
