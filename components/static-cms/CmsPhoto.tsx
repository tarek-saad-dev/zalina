"use client";
import Image, { type ImageProps } from "next/image";
import { useLocale } from "next-intl";
import { useCmsAlt, useCmsImage } from "./CmsImagesProvider";
import type { CmsImageSlot } from "@/lib/static-cms/schema";

export function CmsPhoto({ slot, src, alt, ...props }: Omit<ImageProps, "src"> & { slot: CmsImageSlot | null; src: string }) {
  const locale = useLocale() === "ar" ? "ar" : "en";
  const image = useCmsImage(slot || "zones.hero", src);
  const description = useCmsAlt(slot || "zones.hero", locale, alt);
  return <Image {...props} src={slot ? image : src} alt={slot ? description : alt} />;
}
