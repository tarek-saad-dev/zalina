import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import localFont from "next/font/local";
import { routing } from "@/i18n/routing";
import { LuxuryNavbar } from "@/components/layout/LuxuryNavbar";
import { InitialPageLoader } from "@/components/layout/InitialPageLoader";
import { MotionProvider } from "@/components/motion/MotionProvider";
import "../globals.css";

/** Local Arabic display face (from Cut Salon) — hero / section titles only. */
const laxr = localFont({
  src: [
    {
      path: "../../assets/fonts/LAXR.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-laxr-loaded",
  display: "swap",
  fallback: ["Alexandria", "sans-serif"],
});

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL("https://zalinaarabianvillage.com"),
  authors: [{ name: "Zalina Arabian Village" }],
  icons: {
    icon: "/assets/zalina-logo-full.png",
    shortcut: "/assets/zalina-logo-full.png",
    apple: "/assets/zalina-logo-full.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "Zalina Arabian Village",
    description:
      locale === "ar"
        ? "قرية ثقافية غامرة في الأقصر، مصر — مطبخ مصري، طبخ حي، ترفيه وضيافة على ضفاف النيل."
        : "An immersive cultural village in Luxor, Egypt — Egyptian cuisine, live cooking, entertainment and hospitality beside the Nile.",
    url: "https://zalinaarabianvillage.com",
    image: "https://zalinaarabianvillage.com/assets/zalina-hero-bg.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Luxor",
      addressCountry: "EG",
    },
    inLanguage: locale === "ar" ? "ar-EG" : "en-US",
  };

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${laxr.variable} antialiased min-h-screen bg-bg-main`}
      >
        <NextIntlClientProvider messages={messages}>
          <MotionProvider>
            <InitialPageLoader />
            <LuxuryNavbar />
            {children}
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
