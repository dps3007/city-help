import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redisClient = redisUrl && redisToken ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

const REDIS_TIMEOUT_MS = 350;
const REDIS_BLACKOUT_MS = 60 * 1000;
let redisDisabledUntil = 0;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRedisDisabled = () => !redisClient || Date.now() < redisDisabledUntil;

const safeRedisCall = async (method, ...args) => {
  if (isRedisDisabled()) {
    return null;
  }

  try {
    const result = await Promise.race([
      redisClient[method](...args),
      delay(REDIS_TIMEOUT_MS).then(() => {
        throw new Error("Redis request timed out");
      }),
    ]);

    return result;
  } catch (error) {
    redisDisabledUntil = Date.now() + REDIS_BLACKOUT_MS;
    return null;
  }
};

export const redis = {
  get: (...args) => safeRedisCall("get", ...args),
  set: (...args) => safeRedisCall("set", ...args),
  del: (...args) => safeRedisCall("del", ...args),
};
