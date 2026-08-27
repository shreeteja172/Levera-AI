import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  prefix: "ratelimit:auth",
});

export const generalRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(120, "60 s"),
  prefix: "ratelimit:general",
});

export const chatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "ratelimit:chat",
});

export const chatDailyLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(80, "1 d"),
  prefix: "ratelimit:chat:day",
});

export const premiumModelDailyLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(25, "1 d"),
  prefix: "ratelimit:premium:day",
});

export const analyzeRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, "60 s"),
  prefix: "ratelimit:analyze",
});

export const isRateLimitConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
): Promise<{ success: boolean }> {
  if (!isRateLimitConfigured) {
    return { success: true };
  }
  try {
    const { success } = await limiter.limit(identifier);
    return { success };
  } catch (error) {
    console.error("[rateLimit] check failed, allowing request:", error);
    return { success: true };
  }
}
