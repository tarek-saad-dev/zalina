import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

/**
 * Migrate legacy ?lang=ar|en query links to /ar|/en path prefixes.
 * Booking/wedding deep links previously used query locale only.
 */
export default function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const lang = searchParams.get("lang")?.trim().toLowerCase();

  if (lang === "ar" || lang === "en") {
    const alreadyPrefixed = routing.locales.some(
      (locale) =>
        pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
    );

    if (!alreadyPrefixed) {
      const url = request.nextUrl.clone();
      url.pathname =
        pathname === "/" ? `/${lang}` : `/${lang}${pathname}`;
      url.searchParams.delete("lang");
      return NextResponse.redirect(url);
    }

    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    return NextResponse.redirect(url);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
