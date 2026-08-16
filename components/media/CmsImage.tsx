"use client";

import React, { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import {
  NEUTRAL_MEDIA_ALT,
  NEUTRAL_MEDIA_FALLBACK,
  resolveMediaAlt,
  selectDisplayUrl,
  type CmsMedia,
  type ResolveCoverOptions,
} from "@/lib/media";

type CmsImageBase = {
  media?: CmsMedia | null;
  /** Pre-resolved URL string (never a MediaAsset object). */
  src?: string | null;
  alt?: string;
  altOptions?: ResolveCoverOptions;
  preferThumbnail?: boolean;
  fallbackSrc?: string;
  className?: string;
};

type CmsImageFill = CmsImageBase & {
  fill: true;
  width?: never;
  height?: never;
  sizes: string;
};

type CmsImageSized = CmsImageBase & {
  fill?: false;
  width: number;
  height: number;
  sizes?: string;
};

export type CmsImageProps = (CmsImageFill | CmsImageSized) &
  Omit<
    ImageProps,
    "src" | "alt" | "width" | "height" | "fill" | "sizes" | "onError"
  >;

function asSafeUrl(value: unknown, fallback: string): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed && trimmed !== "[object Object]") return trimmed;
  }
  return fallback;
}

/**
 * Safe CMS image — uses normalized CmsMedia, alt priority, and one-shot fallback.
 * Never accepts a raw MediaAsset object as `src`.
 */
export function CmsImage({
  media,
  src,
  alt,
  altOptions,
  preferThumbnail = false,
  fallbackSrc = NEUTRAL_MEDIA_FALLBACK,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
  ...rest
}: CmsImageProps) {
  const resolvedFromMedia = selectDisplayUrl(media, preferThumbnail);
  const initial = asSafeUrl(src ?? resolvedFromMedia, fallbackSrc);
  const [currentSrc, setCurrentSrc] = useState(initial);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(asSafeUrl(src ?? resolvedFromMedia, fallbackSrc));
    setFailed(false);
  }, [src, resolvedFromMedia, fallbackSrc]);

  const resolvedAlt =
    alt?.trim() ||
    resolveMediaAlt(media, altOptions) ||
    NEUTRAL_MEDIA_ALT;

  const w = media?.width ?? undefined;
  const h = media?.height ?? undefined;

  const onError = () => {
    if (failed) return;
    setFailed(true);
    if (process.env.NODE_ENV === "development") {
      console.warn("[CmsImage] failed to load CMS media:", currentSrc);
    }
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  if (fill) {
    return (
      <Image
        {...rest}
        src={currentSrc}
        alt={resolvedAlt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        onError={onError}
      />
    );
  }

  return (
    <Image
      {...rest}
      src={currentSrc}
      alt={resolvedAlt}
      width={width ?? w ?? 1200}
      height={height ?? h ?? 800}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={onError}
    />
  );
}

export default CmsImage;
