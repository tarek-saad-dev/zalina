import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, getBooking } from "@/lib/api";
import { useBookingStatusPoll } from "../useBookingStatusPoll";

vi.mock("@/lib/api", async (importOriginal) => ({ ...(await importOriginal<typeof import("@/lib/api")>()), getBooking: vi.fn() }));
const fetchBooking = vi.mocked(getBooking);
const booking = (reference: string) => ({ booking_reference: reference, status: "pending_payment", product_type: "day_use" }) as Awaited<ReturnType<typeof getBooking>>;
function deferred<T>() { let resolve!: (value: T) => void; let reject!: (reason: unknown) => void; const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
let latest: ReturnType<typeof useBookingStatusPoll>;
function Probe({ reference, locale = "en" }: { reference: string; locale?: string }) { latest = useBookingStatusPoll({ reference, locale }); return React.createElement("span", null, latest.booking?.booking_reference ?? latest.fetchState); }
afterEach(() => { vi.useRealTimers(); vi.resetAllMocks(); });

describe("booking polling hook", () => {
  it.each(["old-first", "new-first"]) ("owns requests by reference when responses arrive %s", async (order) => {
    const a = deferred<Awaited<ReturnType<typeof getBooking>>>(), b = deferred<Awaited<ReturnType<typeof getBooking>>>();
    fetchBooking.mockImplementation((ref) => ref === "A" ? a.promise : b.promise);
    let root!: ReactTestRenderer;
    await act(async () => { root = create(React.createElement(Probe, { reference: "A" })); });
    await act(async () => { root.update(React.createElement(Probe, { reference: "B" })); });
    expect(fetchBooking).toHaveBeenCalledTimes(2);
    if (order === "old-first") { await act(async () => a.resolve(booking("A"))); expect(latest.booking).toBeNull(); await act(async () => b.resolve(booking("B"))); }
    else { await act(async () => b.resolve(booking("B"))); await act(async () => a.resolve(booking("A"))); }
    expect(latest.booking?.booking_reference).toBe("B");
    await act(async () => root.unmount());
  });
  it("hides a previous booking immediately when the locale changes", async () => {
    const next = deferred<Awaited<ReturnType<typeof getBooking>>>();
    fetchBooking.mockResolvedValueOnce(booking("A")).mockReturnValueOnce(next.promise);
    let root!: ReactTestRenderer;
    const renders: Array<string | null> = [];
    function Capture({ locale }: { locale: string }) { const result = useBookingStatusPoll({ reference: "A", locale }); renders.push(result.booking?.booking_reference ?? null); return null; }
    await act(async () => { root = create(React.createElement(Capture, { locale: "en" })); });
    expect(renders[renders.length - 1]).toBe("A");
    renders.length = 0;
    await act(async () => { root.update(React.createElement(Capture, { locale: "ar" })); });
    expect(renders[0]).toBeNull();
    expect(fetchBooking).toHaveBeenCalledTimes(2);
    await act(async () => root.unmount());
    await act(async () => next.resolve(booking("A")));
  });
  it("retries repeated rate limits and cleans up timers on unmount", async () => {
    vi.useFakeTimers();
    fetchBooking.mockRejectedValueOnce(new ApiError("limited", 429)).mockRejectedValueOnce(new ApiError("limited", 429)).mockResolvedValue(booking("A"));
    let root!: ReactTestRenderer;
    await act(async () => { root = create(React.createElement(React.StrictMode, null, React.createElement(Probe, { reference: "A" }))); });
    await act(async () => { await vi.advanceTimersByTimeAsync(45000); });
    expect(fetchBooking.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(latest.booking?.booking_reference).toBe("A");
    await act(async () => root.unmount());
    const count = fetchBooking.mock.calls.length;
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); });
    expect(fetchBooking).toHaveBeenCalledTimes(count);
  });
});
