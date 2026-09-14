import type { ReactNode } from "react";

/**
 * Root layout is intentionally thin.
 * Locale, dir, providers, and chrome live in `app/[locale]/layout.tsx`.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
