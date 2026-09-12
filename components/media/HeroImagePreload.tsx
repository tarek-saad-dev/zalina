/**
 * Injects a head preload for a static hero image URL.
 *
 * Prefer Next.js `<Image priority />` when using the Image Optimization API —
 * it emits the correct `/_next/image` preload (srcset/sizes). Use this helper
 * only when preloading a direct public asset (e.g. unoptimized or CSS background).
 */
export function HeroImagePreload({
  href,
  type = "image/webp",
}: {
  href: string;
  type?: string;
}) {
  return <link rel="preload" as="image" href={href} type={type} />;
}
