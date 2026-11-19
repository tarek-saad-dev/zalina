/**
 * In-process, fail-closed login attempt reservation.
 * Reserve synchronously before any await/body read/password verification.
 * One running Next.js process is assumed by the VPS Mini CMS deployment.
 */
export function createLoginAttemptLimiter(maxAttempts = 12, windowMs = 10 * 60 * 1000) {
  let count = 0;
  let windowEnd = 0;
  return {
    reserve(now = Date.now()): boolean {
      if (now >= windowEnd) {
        count = 0;
        windowEnd = now + windowMs;
      }
      if (count >= maxAttempts) return false;
      count += 1;
      return true;
    },
  };
}
