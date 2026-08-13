import { ApiError, type ApiEnvelope } from "./types";
import { getApiBaseUrl } from "./config";
import { DEFAULT_API_LOCALE, resolveApiLocale } from "./locale";

export { getApiBaseUrl } from "./config";

/**
 * Browser calls go through the Next.js proxy (`/api/v1/*`) so the
 * upstream request has no localhost Origin (which currently 500s bookings).
 * Server components still hit the absolute API URL from env config.
 */
export function getApiRequestOrigin(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return getApiBaseUrl();
}

export interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  locale?: string;
  body?: unknown;
  searchParams?: Record<string, string | number | undefined | null>;
  /** When false, skip unwrapping `data` (e.g. ping). Default true. */
  unwrap?: boolean;
}

function buildUrl(
  path: string,
  searchParams?: ApiFetchOptions["searchParams"]
): string {
  const origin = getApiRequestOrigin();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const pathWithPrefix = `/api/v1${normalized}`;

  const url = origin
    ? new URL(`${origin}${pathWithPrefix}`)
    : new URL(pathWithPrefix, "http://local.invalid");

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  if (!origin) {
    return `${url.pathname}${url.search}`;
  }
  return url.toString();
}

/**
 * Central envelope parser. Callers receive unwrapped `data` (or throw ApiError).
 * Preserves message, validation errors, HTTP status, and X-Request-Id when present.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const {
    locale,
    body,
    searchParams,
    unwrap = true,
    headers: initHeaders,
    ...rest
  } = options;

  const headers = new Headers(initHeaders);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", resolveApiLocale(locale ?? DEFAULT_API_LOCALE));
  }
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(buildUrl(path, searchParams), {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const requestId =
    res.headers.get("X-Request-Id") ??
    res.headers.get("x-request-id") ??
    undefined;

  let json: ApiEnvelope<T> | null = null;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    json = null;
  }

  if (!res.ok || (json && json.success === false)) {
    throw new ApiError(
      json?.message || `Request failed (${res.status})`,
      res.status,
      json?.errors,
      requestId
    );
  }

  if (!json) {
    throw new ApiError("Empty API response", res.status, undefined, requestId);
  }

  if (!unwrap) {
    return json as unknown as T;
  }

  return json.data;
}

/** Safe catalog fetch — returns fallback on failure instead of throwing. */
export async function apiFetchSafe<T>(
  path: string,
  fallback: T,
  options: ApiFetchOptions = {}
): Promise<T> {
  try {
    return await apiFetch<T>(path, options);
  } catch {
    return fallback;
  }
}
