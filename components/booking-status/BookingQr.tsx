"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface BookingQrProps {
  /** Real booking_code — Smart Entry identity. */
  bookingCode: string;
  label: string;
  size?: number;
}

/**
 * One booking → one QR. Encodes booking_code only (no PII / invented URLs).
 */
export function BookingQr({ bookingCode, label, size = 220 }: BookingQrProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setDataUrl(null);

    void QRCode.toDataURL(bookingCode, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: size * 2,
      color: {
        dark: "#0D0B08",
        light: "#F8F2E7",
      },
    })
      .then((url) => {
        if (!cancelled) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingCode, size]);

  if (failed) {
    return (
      <p style={{ color: "rgba(220,160,100,0.95)", fontSize: "13px" }} role="alert">
        Unable to render QR code.
      </p>
    );
  }

  if (!dataUrl) {
    return (
      <div
        aria-hidden
        style={{
          width: size,
          height: size,
          background: "rgba(255,255,255,0.06)",
          borderRadius: "12px",
        }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt={label}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: "12px",
        background: "#F8F2E7",
        padding: "10px",
        display: "block",
      }}
    />
  );
}
