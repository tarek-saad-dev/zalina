import type { Metadata } from "next";
import "./globals.css";
import { LuxuryNavbar } from "@/components/layout/LuxuryNavbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://zalinaarabianvillage.com"),
  title: "Zalina Arabian Village | Cultural Experiences in Luxor, Egypt",
  description:
    "An immersive cultural village in Luxor, Egypt — Egyptian cuisine, live cooking, entertainment and hospitality beside the Nile.",
  keywords: [
    "Zalina Luxor",
    "Luxor cultural experience",
    "Luxor dinner experience",
    "Egyptian hospitality Luxor",
    "things to do in Luxor",
    "Zalina Arabian Village",
  ],
  authors: [{ name: "Zalina Arabian Village" }],
  icons: {
    icon: "/assets/zalina-logo-full.png",
    shortcut: "/assets/zalina-logo-full.png",
    apple: "/assets/zalina-logo-full.png",
  },
  openGraph: {
    title: "Zalina Arabian Village | Cultural Experiences in Luxor, Egypt",
    description:
      "Egyptian hospitality, dining and cultural evenings in the heart of Luxor — a living village experience beside the Nile.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_EG"],
    siteName: "Zalina Arabian Village",
    images: [
      {
        url: "/assets/zalina-hero-bg.png",
        width: 1200,
        height: 630,
        alt: "Zalina Arabian Village — cultural village in Luxor, Egypt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zalina Arabian Village | Cultural Experiences in Luxor, Egypt",
    description:
      "Egyptian hospitality, dining and cultural evenings in Luxor — beside the Nile.",
    images: ["/assets/zalina-hero-bg.png"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: "Zalina Arabian Village",
    description:
      "An immersive cultural village in Luxor, Egypt — Egyptian cuisine, live cooking, entertainment and hospitality beside the Nile.",
    url: "https://zalinaarabianvillage.com",
    image: "https://zalinaarabianvillage.com/assets/zalina-hero-bg.png",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Luxor",
      addressCountry: "EG",
    },
  };

  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-bg-main">
        <LuxuryNavbar />
        {children}
      </body>
    </html>
  );
}
