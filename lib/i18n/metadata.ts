import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import type { ApiLocale } from "@/lib/api/locale";
import { resolveApiLocale } from "@/lib/api/locale";

type SeoKey =
  | "home"
  | "about"
  | "experiences"
  | "zones"
  | "gallery"
  | "weddings"
  | "bookNow"
  | "booking"
  | "bookingStatus";

export function localeFromParams(locale: string | undefined): ApiLocale {
  return resolveApiLocale(locale);
}

export async function buildPageMetadata(
  locale: string,
  seoKey: SeoKey,
  path: string = ""
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "seo" });
  const title = t(`${seoKey}.title`);
  const description = t(`${seoKey}.description`);
  const ogKey = `${seoKey}.ogDescription`;
  const ogDescription = t.has(ogKey) ? t(ogKey) : description;

  const normalizedPath = path === "/" ? "" : path.replace(/\/$/, "");
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `/${loc}${normalizedPath}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${normalizedPath}`,
      languages,
    },
    openGraph: {
      title,
      description: ogDescription,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_EG"],
      siteName: "Zalina Arabian Village",
      type: "website",
      images: [
        {
          url: "/assets/zalina-hero-bg.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: ogDescription,
      images: ["/assets/zalina-hero-bg.png"],
    },
  };
}
