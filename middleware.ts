import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

/** Production public origin — used when Node sees an internal host behind a reverse proxy. */
const FALLBACK_PUBLIC_ORIGIN = "https://zalinaarabianvillage.com";

const INTERNAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const INTERNAL_PORTS = new Set(["3000", "3001", "3300", "8080", "8000"]);

function isInternalHostname(hostname: string): boolean {
  return INTERNAL_HOSTS.has(hostname.toLowerCase());
}

/**
 * Resolve the browser-facing origin.
 * Behind nginx/Caddy the request URL is often http://localhost:3300 — never redirect there.
 */
function resolvePublicOrigin(request: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const xfHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const hostHeader = request.headers.get("host")?.split(",")[0]?.trim();
  const host = xfHost || hostHeader;

  if (host) {
    const hostname = host.replace(/:\d+$/, "");
    if (!isInternalHostname(hostname)) {
      const protoHeader = request.headers
        .get("x-forwarded-proto")
        ?.split(",")[0]
        ?.trim();
      const proto =
        protoHeader === "http" || protoHeader === "https"
          ? protoHeader
          : "https";
      // Drop leaked internal ports from host (e.g. zalina.com:3300).
      const portMatch = host.match(/:(\d+)$/);
      const port = portMatch?.[1];
      if (port && INTERNAL_PORTS.has(port)) {
        return `${proto}://${hostname}`;
      }
      return `${proto}://${host}`;
    }
  }

  return FALLBACK_PUBLIC_ORIGIN;
}

/** Rebuild the incoming request so next-intl redirects use the public origin. */
function withPublicRequest(request: NextRequest): NextRequest {
  const publicOrigin = resolvePublicOrigin(request);
  const publicUrl = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    publicOrigin
  );

  if (publicUrl.href === request.url) {
    return sanitizeForwardedHeaders(request, publicOrigin);
  }

  const headers = new Headers(request.headers);
  applyPublicForwardedHeaders(headers, publicOrigin);

  return new NextRequest(publicUrl, {
    headers,
    method: request.method,
  });
}

function applyPublicForwardedHeaders(headers: Headers, publicOrigin: string): void {
  const origin = new URL(publicOrigin);
  headers.set("x-forwarded-host", origin.host);
  headers.set("host", origin.host);
  headers.set("x-forwarded-proto", origin.protocol.replace(":", ""));
  headers.set(
    "x-forwarded-port",
    origin.port || (origin.protocol === "https:" ? "443" : "80")
  );
}

function sanitizeForwardedHeaders(
  request: NextRequest,
  publicOrigin: string
): NextRequest {
  const headers = new Headers(request.headers);
  const forwardedPort = headers.get("x-forwarded-port")?.split(",")[0]?.trim();
  const needsSanitize =
    !!forwardedPort &&
    INTERNAL_PORTS.has(forwardedPort) &&
    !headers.get("x-forwarded-host")?.includes(":");

  if (!needsSanitize && !isInternalHostname(request.nextUrl.hostname)) {
    return request;
  }

  applyPublicForwardedHeaders(headers, publicOrigin);
  const publicUrl = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    publicOrigin
  );
  return new NextRequest(publicUrl, {
    headers,
    method: request.method,
  });
}

/** Last-resort: rewrite Location if a redirect still points at an internal host. */
function fixRedirectLocation(
  response: NextResponse,
  publicOrigin: string
): NextResponse {
  const location = response.headers.get("location");
  if (!location) return response;

  try {
    const loc = new URL(location, publicOrigin);
    const badHost = isInternalHostname(loc.hostname);
    const badPort = INTERNAL_PORTS.has(loc.port);

    if (!badHost && !badPort) return response;

    const fixed = new URL(
      `${loc.pathname}${loc.search}${loc.hash}`,
      publicOrigin
    );
    response.headers.set("location", fixed.toString());
  } catch {
    // leave original location
  }

  return response;
}

/**
 * Migrate legacy ?lang=ar|en query links to /ar|/en path prefixes.
 * Also normalize public origin so locale redirects never leak localhost:3300.
 */
export default function middleware(request: NextRequest) {
  const publicOrigin = resolvePublicOrigin(request);
  const publicRequest = withPublicRequest(request);
  const { pathname, searchParams } = publicRequest.nextUrl;
  const lang = searchParams.get("lang")?.trim().toLowerCase();

  if (lang === "ar" || lang === "en") {
    const alreadyPrefixed = routing.locales.some(
      (locale) =>
        pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
    );

    const url = publicRequest.nextUrl.clone();
    if (!alreadyPrefixed) {
      url.pathname =
        pathname === "/" ? `/${lang}` : `/${lang}${pathname}`;
    }
    url.searchParams.delete("lang");
    return fixRedirectLocation(NextResponse.redirect(url), publicOrigin);
  }

  const response = handleI18nRouting(publicRequest);
  return fixRedirectLocation(response, publicOrigin);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
