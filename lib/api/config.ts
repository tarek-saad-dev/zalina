/**
 * Central API origin configuration.
 * Never hard-code the production host in feature modules — always use this.
 */
export function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!raw) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_BASE_URL. Set it in your environment (see .env.example)."
    );
  }
  return raw.replace(/\/$/, "");
}
