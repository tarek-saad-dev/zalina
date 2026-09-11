/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.zalinaarabianvillage.com",
        pathname: "/**",
      },
    ],
  },
  i18n: {
    locales: ["en", "ar"],
    defaultLocale: "en",
    localeDetection: false,
  },
};

module.exports = nextConfig;
