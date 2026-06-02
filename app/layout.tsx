import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zalina Arabian Village | Luxury Heritage Experience",
  description: "An immersive Arabian luxury destination where heritage meets elegance. Experience authentic hospitality in a breathtaking setting.",
  keywords: ["Arabian village", "luxury resort", "heritage", "hospitality", "dubai", "authentic experience"],
  authors: [{ name: "Zalina Arabian Village" }],
  openGraph: {
    title: "Zalina Arabian Village | Luxury Heritage Experience",
    description: "An immersive Arabian luxury destination where heritage meets elegance.",
    type: "website",
    locale: "en_US",
    alternateLocale: ["ar_SA"],
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
        {children}
      </body>
    </html>
  );
}
