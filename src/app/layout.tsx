import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zalina Arabian Village | Cultural Experiences in Luxor, Egypt",
  description:
    "An immersive cultural village in Luxor, Egypt — Egyptian cuisine, live cooking, entertainment and hospitality beside the Nile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
