import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MotionPlayground } from "@/components/motion/MotionPlayground";

export const metadata: Metadata = {
  title: "Motion foundation (dev)",
  robots: { index: false, follow: false },
};

/**
 * Isolated motion smoke route — not in site navigation.
 * Available in development only so production builds do not ship a test surface.
 */
export default function DevMotionPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zalina-bg pt-28 pb-20">
      <MotionPlayground />
    </main>
  );
}
