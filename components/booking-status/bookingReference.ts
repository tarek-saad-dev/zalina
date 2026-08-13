/**
 * Conservative booking_reference validation.
 * Accepts Zalina-like references; rejects empty / path junk / obvious injection.
 */
export function isValidBookingReference(raw: string | null | undefined): boolean {
  if (!raw || typeof raw !== "string") return false;
  const value = raw.trim();
  if (value.length < 6 || value.length > 80) return false;
  // Letters, digits, hyphen, underscore only
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(value)) return false;
  if (value.includes("..") || value.includes("/") || value.includes("\\")) {
    return false;
  }
  return true;
}

export function sanitizeBookingReference(
  raw: string | null | undefined
): string | null {
  if (!isValidBookingReference(raw)) return null;
  return String(raw).trim();
}
