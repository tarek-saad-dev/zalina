# Source Alignment and Version Decision Log

**Purpose:** Make backend/CMS handoff honest about differences between the project's original ANV documentation and the **currently active** Next.js Booking Domain V2 code. No silent conversion of old V1 fields or assumptions that proposed endpoints are deployed.

## References examined

These files were provided with the Zalina project and must remain available to the backend/CMS team:
- `Zalina.pdf` — Zalina business purpose, premium cultural events/experiences and booking journey.
- `ANV PRD.pdf` — original Arabian Nation Village product scope, bilingual web/admin, generic CMS and single gateway.
- `ANV-Booking flow.pdf` — accommodation booking, addons/experiences, atomic booking creation, payment webhook and ticket generation.
- `Anv Api Design Specification.pdf` — original v1 routes and response examples.
- `Anv Architecture Modules.pdf` — Laravel modular monolith and responsibilities of Booking, Availability, Payment, Ticket, CMS and Media modules.
- `Anv Business Logic Services Specification.pdf` — services-layer orchestration, transaction, locking, idempotency and notification responsibilities.
- `Anv Validation Rules Specification.pdf` — Laravel Form Requests, nested validation and sanitization.

These original files describe **ANV v1 / original scope**, not necessarily the currently deployed Laravel implementation. We did NOT inspect the production Laravel repository or DB.

## Where sources agree with new Events frontend

- `Zalina.pdf` explicitly positions Zalina as a luxury experience platform including **cultural events**; standalone event product pages match that product direction.
- The ANV architecture specification describes a **Laravel Modular Monolith** with separate business responsibilities; the event extension should remain inside the existing application/modules, not a second independent billing stack.
- The ANV booking flow and service documents require **atomic booking**, real availability and pricing, verified gateway events and tickets **only after successful payment**; the Next.js frontend preserves the same security principle.
- The ANV API design uses the prefix `/api/v1`, separate public/admin endpoints and Sanctum for admin auth; proposed event/CMS APIs follow that pattern.
- The ANV validation rules require Laravel Form Requests and server-side authoritative validation; the event handoff requires additional occurrence, package and guest validations in Laravel.

## Important discrepancies requiring explicit backend decision

| Topic | Original ANV documentation | Current Next.js frontend implementation | Decision needed |
|---|---|---|---|
| Booking create shape | `accommodation_id`, `check_in_date`, `check_out_date`, `add_ons[]`, `experiences[]` (v1) | Booking Domain V2 discriminated `product_type=day_use|bubble_stay|wedding|event`; v1 fields explicitly rejected | Confirm authoritative deployed Booking V2 contract before extending with `event` |
| Lifecycle | `pending -> confirmed|failed|cancelled` | `pending_payment -> paid -> confirmed` and ticket-ready states | Map/normalize backend statuses explicitly; do not change frontend without agreement |
| Gateway | ANV PRD allows Fawry or Stripe; ANV architecture mentions Fawry/Apple Pay/Stripe readiness | Existing Next.js `PaymentGateway = paymob|mock`; `POST /bookings/{reference}/pay` | Confirm production gateway/return behavior; reuse existing payment service |
| Ticket shape | ANV v1 `GET /tickets/{code}` example is `{valid,type,date}` | Current Next.js booking-level ticket/QR lookup with booking reference, guests, dates, status and optional snapshots | Confirm backend's actual ticket response and whether booking-level QR is sufficient |
| CMS scope | ANV v1 CMS manages blogs/pages plus basic `/admin/content/{type}` | New Events/Promotions CMS spec proposes dedicated editor screens and routes | Decide dedicated modules vs extending existing CMSResource module; enforce same RBAC/audit |
| Event inventory | Original booking flow focuses on accommodation/experience add-ons | Independent event occurrences/packages with no accommodation required | Implement new occurrence/package inventory service without misusing accommodation-overlap fields |
| Public experiences | ANV v1 mentions bookable experiences/add-ons | Active Next.js `lib/api/catalog.ts` treats experiences as marketing content only | Keep event catalog separate until backend product type contract explicitly agrees |
| Money/pricing | Original examples use numeric totals | Active frontend reads decimal string totals and server-confirmed amounts | Backend must send compatible decimal strings and snapshot line prices |

**Priority rule:** For this frontend integration, the **connected repository's live V2 TypeScript contract** controls the expected frontend DTO; original PDFs are architecture/background, not proof that Laravel V2 endpoints exist. The Laravel owner must sign off or propose an explicit compatibility adapter before production integration.

## Expected Laravel module mapping (proposal, not implemented)

- **Event Domain**: event metadata, occurrence, package and publication rules; a new module or clearly bounded submodule.
- **AvailabilityService**: event-specific occupancy/seat/bundle allocation and release of holds, coordinated with existing booking policies.
- **PricingService**: currency, package-unit pricing, discounts/taxes and immutable snapshots.
- **BookingService**: accepts Booking V2 `event` branch and performs transaction, creates a `pending_payment` hold.
- **PaymentService**: reuse existing gateway initiation, verify webhooks, idempotently transition status.
- **TicketService**: issue booking-level QR/tickets only after confirmed payment.
- **CMSService + MediaService**: new event/campaign editor fields, image uploads, publish/disable.
- **NotificationService**: booking/confirmation notices following existing channels; no speculative message deliveries from frontend.

Maintain Laravel Form Requests, thin controllers, service-layer orchestration, DB transactions/locks, audit and admin authorization.

## Required owner approvals before the "integrated" label

- Backend: confirm actual `POST /bookings` V2 request/response and event field names.
- Payments: confirm Paymob production vs test gateways, return URLs, webhook signature and retry policy.
- Inventory: confirm capacity model, hold duration, concurrent sell-out and release behavior.
- Tickets/operations: one QR per booking vs per attendee and how partial admission is tracked.
- CMS: decide new /admin/events and /admin/campaigns endpoints or compatible content module extension.
- Frontend: rerun AR/EN, responsive and status/QR regression against *staging* Laravel after these decisions.

Until these agreements, frontend demo mode and API contract documents are **implementation-ready handoff only**, not backend integration proof.
