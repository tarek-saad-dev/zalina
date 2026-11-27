import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EventBooking, EventEdition, EventAvailability, EventStatusOnly } from "@/lib/api/events";

const mocks = vi.hoisted(() => ({ availability: vi.fn(), createBooking: vi.fn(), push: vi.fn(), refresh: vi.fn(async () => undefined), pay: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }) }));
vi.mock("@/i18n/navigation", () => ({ Link: ({ children, href }: any) => React.createElement("a", { href }, children) }));
vi.mock("@/lib/api/events", async importOriginal => ({ ...await importOriginal<typeof import("@/lib/api/events")>(), getEventAvailability: mocks.availability, createEventBooking: mocks.createBooking }));
vi.mock("@/lib/api/payments", () => ({ initiatePayment: mocks.pay }));
import { EventAnnouncementView } from "../EventAnnouncement";
import { EventLanding } from "../EventLanding";
import { EventBookingStatus } from "../EventBookingStatus";
import { ApiError } from "@/lib/api/types";

const pkg = (id: number, price: string) => ({ id, name_en: `Package ${id}`, name_ar: `باقة ${id}`, description_en: null, description_ar: null, guests_per_package: 2, website_price: price, image_url: null, is_purchasable: true, remaining_units: null, max_purchasable_units: null, is_active: true });
const event: EventEdition = { availability_state: "booking_open", slug: "sample", event_edition_id: 5, name_en: "Event", name_ar: "فعالية", description_en: null, description_ar: null, cover_url: null, gallery: [], event_starts_at: null, event_ends_at: null, admission_opens_at: null, admission_closes_at: null, sales_opens_at: null, sales_closes_at: null, currency: "EGP", packages: [pkg(1, "0.00"), pkg(2, "12.50")], remaining_guest_capacity: 10, public_sales_enabled: true, purchase_enabled: true };
const available: EventAvailability = { availability_state: "booking_open", remaining_guest_capacity: 10, sales_enabled: true, packages: event.packages.map(({ id, remaining_units, max_purchasable_units, is_purchasable }) => ({ id, remaining_units, max_purchasable_units, is_purchasable })) };
const booking: EventBooking = { booking_reference: "EV-TEST-1", booking_code: "CODE", product_type: "event", status: "confirmed", operational_status: null, total: "0.00", currency: "EGP", guests: 2, hold_expires_at: null, payment_expires_at: null, valid_from: null, valid_to: null, requires_payment: false };
const announcement = { type: "card" as const, title_en: "First", title_ar: "أول", description_en: null, description_ar: null, image_url: null, event_edition_id: 5, edition_slug: "sample", landing_path: "/events/sample" };
let rendered: ReactTestRenderer | undefined;
const text = () => JSON.stringify(rendered!.toJSON());
afterEach(() => { if (rendered) act(() => rendered!.unmount()); rendered = undefined; vi.clearAllMocks(); vi.unstubAllGlobals(); });
function storage() { const data = new Map<string, string>(); vi.stubGlobal("sessionStorage", { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => data.set(k, v), removeItem: (k: string) => data.delete(k) }); return data; }

describe("Event screen acceptance", () => {
  it("renders card and banner replacements and clears invalid announcements", () => {
    act(() => { rendered = create(React.createElement(EventAnnouncementView, { announcement, locale: "en" })); });
    expect(text()).toContain("First"); expect(text()).toContain("/events/sample");
    act(() => rendered!.update(React.createElement(EventAnnouncementView, { announcement: { ...announcement, type: "banner", title_en: "Replacement" }, locale: "en" })));
    expect(text()).toContain("Replacement"); expect(text()).not.toContain("First");
    act(() => rendered!.update(React.createElement(EventAnnouncementView, { announcement: { ...announcement, landing_path: "//evil.invalid" }, locale: "en" })));
    expect(rendered!.toJSON()).toBeNull();
  });
  it.each(["sales_not_open", "booking_open", "sold_out", "sales_closed", "archived", "cancelled"] as const)("renders %s without commercial content for status-only editions", async state => {
    storage(); mocks.availability.mockResolvedValue(available);
    const value: EventEdition | EventStatusOnly = state === "archived" || state === "cancelled" ? { ...event, availability_state: state, is_cancelled: state === "cancelled", purchase_enabled: false as const } : { ...event, availability_state: state };
    await act(async () => { rendered = create(React.createElement(EventLanding, { event: value, locale: "en", preview: false })); });
    expect(text()).toContain(state === "archived" ? "Event archived" : state === "cancelled" ? "Event cancelled" : state === "sold_out" ? "Sold out" : state === "sales_closed" ? "Sales closed" : state === "sales_not_open" ? "Sales have not opened" : "Booking open");
    if (state === "archived" || state === "cancelled") expect(text()).not.toContain("Package 1");
  });
  it("allows only one availability refresh while a request is pending", async () => {
    storage();
    let finish!: (value: EventAvailability) => void;
    const pending = new Promise<EventAvailability>(resolve => { finish = resolve; });
    mocks.availability.mockReturnValue(pending);
    await act(async () => { rendered = create(React.createElement(EventLanding, { event, locale: "en", preview: false })); });
    const button = rendered!.root.findAllByType("button").find(b => b.props.children === "Refresh availability")!;
    expect(button.props.disabled).toBe(true);
    await act(async () => { button.props.onClick(); button.props.onClick(); });
    expect(mocks.availability).toHaveBeenCalledTimes(1);
    await act(async () => { finish(available); });
    expect(rendered!.root.findAllByType("input").filter(i => i.props.type === "number")).toHaveLength(2);
  });
  it("blocks preview purchases and does not fetch availability", async () => {
    storage(); await act(async () => { rendered = create(React.createElement(EventLanding, { event, locale: "ar", preview: true })); });
    expect(text()).toContain("معاينة"); expect(rendered!.root.findAllByType("button")).toHaveLength(0); expect(mocks.availability).not.toHaveBeenCalled();
  });
  it("fails closed when browser storage is blocked", async () => {
    vi.stubGlobal("sessionStorage", { getItem: () => { throw new Error("blocked"); } });
    mocks.availability.mockResolvedValue(available);
    await act(async () => { rendered = create(React.createElement(EventLanding, { event, locale: "en", preview: false })); });
    expect(text()).toContain("Booking is unavailable when browser storage is disabled.");
    expect(mocks.createBooking).not.toHaveBeenCalled();
    expect(rendered!.root.findAllByType("button").some(b => b.props.children === "Book now")).toBe(false);
  });
  it("creates exactly one mixed-package booking despite duplicate submit", async () => {
    storage(); mocks.availability.mockResolvedValue(available); mocks.createBooking.mockResolvedValue(booking);
    vi.stubGlobal("FormData", class { get(k: string) { return ({ name: "Guest", email: "guest@example.invalid", phone: "000" } as Record<string, string>)[k]; } });
    await act(async () => { rendered = create(React.createElement(EventLanding, { event, locale: "en", preview: false })); });
    const inputs = rendered!.root.findAllByType("input").filter(i => i.props.type === "number");
    act(() => { inputs[0].props.onChange({ target: { value: "1" } }); });
    act(() => { inputs[1].props.onChange({ target: { value: "2" } }); });
    expect(text()).toContain("25.00");
    const form = rendered!.root.findByType("form");
    await act(async () => { const e = { preventDefault() {}, currentTarget: {} }; await Promise.all([form.props.onSubmit(e), form.props.onSubmit(e)]); });
    expect(mocks.createBooking).toHaveBeenCalledTimes(1);
    expect(mocks.createBooking).toHaveBeenCalledWith({ event_edition_id: 5, packages: [{ package_id: 1, quantity: 1 }, { package_id: 2, quantity: 2 }], guest_name: "Guest", guest_email: "guest@example.invalid", guest_phone: "000" }, "en");
    expect(mocks.push).toHaveBeenCalledWith("/en/events/booking/EV-TEST-1");
  });
  it("blocks repeat submission after an ambiguous create, including after remount", async () => {
    const saved = storage(); mocks.availability.mockResolvedValue(available); mocks.createBooking.mockRejectedValue(new Error("connection lost"));
    vi.stubGlobal("FormData", class { get(k: string) { return ({ name: "Guest", email: "guest@example.invalid", phone: "000" } as Record<string, string>)[k]; } });
    await act(async () => { rendered = create(React.createElement(EventLanding, { event, locale: "en", preview: false })); });
    act(() => rendered!.root.findAllByType("input").find(i => i.props.type === "number")!.props.onChange({ target: { value: "1" } }));
    await act(async () => { await rendered!.root.findByType("form").props.onSubmit({ preventDefault() {}, currentTarget: {} }); });
    expect(mocks.createBooking).toHaveBeenCalledTimes(1); expect(saved.get("event-create-uncertain:sample")).toBe("1"); expect(text()).toContain("may have been created");
    act(() => rendered!.unmount());
    await act(async () => { rendered = create(React.createElement(EventLanding, { event, locale: "en", preview: false })); });
    expect(text()).toContain("may have been created"); expect(rendered!.root.findAllByType("button").every(b => b.props.children !== "Book now")).toBe(true);
  });
  it("does not offer payment after the hold expires", () => {
    const expired = { ...booking, status: "pending_payment", total: "12.50", requires_payment: true, hold_expires_at: "2000-01-01T00:00:00Z" };
    act(() => { rendered = create(React.createElement(EventBookingStatus, { reference: "EV-TEST-1", locale: "en", booking: expired, refresh: vi.fn(async () => undefined), fresh: true, inFlight: { current: false } })); });
    expect(text()).not.toContain("Continue to payment"); expect(mocks.pay).not.toHaveBeenCalled();
  });
  it("refreshes on a payment conflict and does not automatically retry", async () => {
    const pending = { ...booking, status: "pending_payment", total: "12.50", requires_payment: true, hold_expires_at: "2099-01-01T00:00:00Z" };
    const refresh = vi.fn().mockResolvedValue(undefined); mocks.pay.mockRejectedValue(new ApiError("Conflict", 409));
    act(() => { rendered = create(React.createElement(EventBookingStatus, { reference: "EV-TEST-1", locale: "en", booking: pending, refresh, fresh: true, inFlight: { current: false } })); });
    const button = rendered!.root.findAllByType("button").find(b => b.props.children === "Continue to payment")!;
    await act(async () => { await button.props.onClick(); });
    expect(mocks.pay).toHaveBeenCalledTimes(1); expect(refresh).toHaveBeenCalledTimes(1); expect(text()).not.toContain("Continue to payment");
  });
  it("shows pending and failed fulfillment and distinguishes invalidated tickets without offering payment", () => {
    const tickets = [{ ticket_code: "T-1", package_name_en: "Table", package_name_ar: null, guests_per_package: 2, status: "valid" as const }, { ticket_code: "T-2", package_name_en: null, package_name_ar: null, guests_per_package: null, status: "invalidated" as const }];
    const props: React.ComponentProps<typeof EventBookingStatus> = { reference: "EV-TEST-1", locale: "en", booking: { ...booking, status: "paid", ticket_fulfillment_status: "processing" as const, tickets }, refresh: vi.fn(async () => undefined), fresh: true, inFlight: { current: false } };
    act(() => { rendered = create(React.createElement(EventBookingStatus, props)); });
    expect(text()).toContain("being prepared"); expect(text()).toContain("Valid for admission"); expect(text()).toContain("Invalidated"); expect(text()).not.toContain("Continue to payment");
    act(() => rendered!.update(React.createElement(EventBookingStatus, { ...props, booking: { ...props.booking, ticket_fulfillment_status: "failed" as const } })));
    expect(text()).toContain("contact support"); expect(text()).not.toContain("Continue to payment");
  });
});
