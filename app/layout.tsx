import type { Metadata } from "next";
import "./globals.css";
import { LuxuryNavbar } from "@/components/layout/LuxuryNavbar";

export const metadata: Metadata = {
  title: "Zalina Arabian Village | Luxury Heritage Experience",
  description: "An immersive Arabian luxury destination where heritage meets elegance. Experience authentic hospitality in a breathtaking setting.",
  keywords: ["Arabian village", "luxury resort", "heritage", "hospitality", "dubai", "authentic experience"],
  authors: [{ name: "Zalina Arabian Village" }],
  icons: {
    icon: "/assets/zalina-logo-full.png",
    shortcut: "/assets/zalina-logo-full.png",
    apple: "/assets/zalina-logo-full.png",
  },
  openGraph: {
    title: "Zalina Arabian Village | Ancient Egypt Luxury Resort",
    description: "A luxury heritage destination where Ancient Egyptian grandeur meets modern hospitality. World-class weddings, immersive experiences, and unforgettable moments await.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_SA"],
    siteName: "Zalina Arabian Village",
    images: [
      {
        url: "/assets/zalina-hero-bg.png",
        width: 1200,
        height: 630,
        alt: "Zalina Arabian Village - Luxury Heritage Resort in Egypt",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zalina Arabian Village | Ancient Egypt Luxury Resort",
    description: "Where Ancient Egyptian grandeur meets modern luxury. Discover world-class hospitality.",
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
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen bg-bg-main">
        <LuxuryNavbar />
        {children}
      </body>
    </html>
  );
}
