import { ApiError, type ApiEnvelope } from "./types";

const DEFAULT_BASE = "https://api.zalinaarabianvillage.com";

/** Absolute upstream API origin (server / SSR). */
export function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || DEFAULT_BASE;
  return raw.replace(/\/$/, "");
}

/**
 * Browser calls go through the Next.js rewrite (`/api/v1/*`) so the
 * upstream request has no localhost Origin (which currently 500s bookings).
 * Server components still hit the absolute API URL.
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

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const {
    locale = "en",
    body,
    searchParams,
    unwrap = true,
    headers: initHeaders,
    ...rest
  } = options;

  const headers = new Headers(initHeaders);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", locale);
  }
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(buildUrl(path, searchParams), {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

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
      json?.errors
    );
  }

  if (!json) {
    throw new ApiError("Empty API response", res.status);
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
