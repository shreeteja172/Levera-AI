import { Prisma } from "@/lib/generated/prisma/client";
import { logger } from "@/lib/logger";

const TRANSIENT_ERROR_CODES = new Set([
  "P1001",
  "P1002",
  "P1008",
  "P1011",
  "P1017",
  "P2024",
]);

function isTransientError(error: any): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return TRANSIENT_ERROR_CODES.has(error.code);
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }
  if (
    error?.message &&
    (error.message.includes("timeout") ||
      error.message.includes("connection closed") ||
      error.message.includes("network") ||
      error.message.includes("database is unavailable"))
  ) {
    return true;
  }
  return false;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number } = {},
): Promise<T> {
  const maxRetries = options.maxRetries ?? 3;
  const baseDelay = options.baseDelay ?? 1000;

  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      if (attempt > maxRetries || !isTransientError(error)) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(
        { err: error, attempt, nextRetryDelay: delay },
        "Transient database error encountered. Retrying...",
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
