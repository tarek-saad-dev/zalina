import { expect, test } from "@playwright/test";

/**
 * Browser smoke tests use clearly labelled development fixtures ONLY.
 * They never POST bookings/payments to Laravel and cannot issue real tickets.
 */

test("English catalogue, detail page and package checkout CTA render without horizontal overflow", async ({ page }, testInfo) => {
  await page.goto("/en/events");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { level: 1, name: "Gather for something extraordinary." })).toBeVisible();
  await expect(page.getByText("DEVELOPMENT PREVIEW — FICTIONAL CONTENT")).toBeVisible();
  await page.locator('a[href*="/events/christmas-night-preview"]').first().click();
  await expect(page.getByRole("heading", { level: 1, name: "Christmas Night at Zalina" })).toBeVisible();
  // Event detail has its own packages CTA; floating promotions must never obscure it.
  await page.evaluate(() => window.scrollTo(0, 1100));
  await expect(page.getByRole("complementary", { name: "Zalina featured event" })).toHaveCount(0);
  const checkout = page.getByRole("link", { name: "Proceed to booking" });
  await expect(checkout).toBeVisible();
  await expect(checkout).toHaveAttribute("href", /occurrence_id=9101.*package_id=9201.*quantity=1/);
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  expect(hasOverflow, "The event detail page must not overflow horizontally").toBe(false);
  // Full-page screenshots with a fixed navbar must start at scroll position zero;
  // otherwise stitched screenshots can misleadingly paint the nav mid-document.
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await testInfo.attach("event-detail", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
});

test("English standalone booking flows to explicitly non-paying preview and never hits POST /bookings", async ({ page }, testInfo) => {
  const bookingMutations: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && /\/api\/v1\/bookings(?:\/|\?|$)/.test(request.url())) {
      bookingMutations.push(request.url());
    }
  });
  await page.goto("/en/events/christmas-night-preview");
  await page.getByRole("link", { name: "Proceed to booking" }).click();
  await expect(page).toHaveURL(/\/en\/events\/christmas-night-preview\/book\?/);
  await expect(page.getByRole("heading", { level: 1, name: "Reserve your occasion" })).toBeVisible();
  await expect(page.getByText("DEVELOPMENT PREVIEW — FICTIONAL PRICES, NO PAYMENT")).toBeVisible();
  await page.locator("#event-guest-name").fill("Browser Test Guest");
  await page.locator("#event-guest-email").fill("browser@example.com");
  await page.locator("#event-guest-phone").fill("+201001234567");
  await page.getByRole("button", { name: "Review reservation" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Review booking" })).toBeVisible();
  await testInfo.attach("event-booking-review", { body: await page.screenshot(), contentType: "image/png" });
  await page.getByRole("button", { name: "Finish preview (no payment)" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Preview complete — no booking was made" })).toBeVisible();
  await page.getByRole("button", { name: "Confirmed (preview)" }).click();
  await expect(page.getByText("Digital ticket and QR appear only when the real backend confirms payment")).toBeVisible();
  expect(bookingMutations).toEqual([]);
});

test("Arabic event booking is RTL, preserves package selection, and validates guest details", async ({ page }) => {
  await page.goto("/ar/events/christmas-night-preview");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1, name: "ليلة الكريسماس في زالينا" })).toBeVisible();
  await page.getByRole("link", { name: "استكمل الحجز" }).click();
  await expect(page).toHaveURL(/\/ar\/events\/christmas-night-preview\/book\?/);
  await expect(page.getByRole("heading", { level: 1, name: "احجز مناسبتك" })).toBeVisible();
  const button = page.getByRole("button", { name: "مراجعة الحجز" });
  // Empty details are submit-able to surface localized field validation errors.
  await button.click();
  await expect(page.getByText("من فضلك اكتب بيانات صحيحة.")).toBeVisible();
  await expect(page.locator("#event-guest-name")).toHaveAttribute("aria-invalid", "true");
  await page.locator("#event-guest-name").fill("زائر تجريبي");
  await page.locator("#event-guest-email").fill("demo@example.com");
  await page.locator("#event-guest-phone").fill("+201001234567");
  await expect(button).toBeEnabled();
  await button.click();
  await expect(page.getByRole("heading", { level: 2, name: "مراجعة الحجز" })).toBeVisible();
  await page.getByRole("button", { name: "إنهاء المعاينة (بدون دفع)" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "اكتملت المعاينة — لم يتم إنشاء حجز" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)).toBe(false);
});

test("Sold-out event never offers a bookable checkout link", async ({ page }) => {
  await page.goto("/en/events/new-years-eve-preview");
  await expect(page.getByRole("heading", { level: 1, name: "New Year's Eve" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Proceed to booking" })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Proceed to booking" })).toHaveCount(0);
});

test("Unknown event shows a usable not-found recovery link", async ({ page }) => {
  await page.goto("/en/events/missing-preview");
  await expect(page.getByText("We couldn't find this event")).toBeVisible();
  await page.getByRole("link", { name: "Back to all events" }).click();
  await expect(page).toHaveURL(/\/en\/events\/?$/);
});


test("Both promotion placements fit below the navbar, dismiss independently and persist dismissals", async ({ page }, testInfo) => {
  await page.goto("/en/events");
  const top = page.getByRole("complementary", { name: "Zalina announcement" });
  const floating = page.getByRole("complementary", { name: "Zalina featured event" });
  await expect(top).toBeVisible();
  // Floating CTA waits until browsing begins; it must not cover the first-screen hero.
  await expect(floating).toHaveCount(0);
  await page.evaluate(() => window.scrollTo(0, Math.max(900, window.innerHeight)));
  await expect(floating).toBeVisible();
  await expect(top.getByRole("link", { name: "Explore packages" })).toHaveAttribute("href", "/en/events/christmas-night-preview");
  const navBox = await page.locator(".zalina-navbar").boundingBox();
  const topBox = await top.boundingBox();
  expect(navBox).not.toBeNull();
  expect(topBox).not.toBeNull();
  expect(topBox!.y).toBeGreaterThanOrEqual(navBox!.y + navBox!.height - 2);
  await testInfo.attach("promotion-placements", { body: await page.screenshot(), contentType: "image/png" });
  await page.getByRole("button", { name: "Dismiss announcement" }).click();
  await expect(top).toHaveCount(0);
  await expect(floating).toBeVisible();
  await page.getByRole("button", { name: "Dismiss offer" }).click();
  await expect(floating).toHaveCount(0);
  await page.reload();
  await expect(top).toHaveCount(0);
  await expect(floating).toHaveCount(0);
});

test("Promotion surfaces are suppressed throughout event checkout", async ({ page }) => {
  await page.goto("/en/events/christmas-night-preview/book?occurrence_id=9101&package_id=9201&quantity=1");
  await expect(page.getByRole("heading", { level: 1, name: "Reserve your occasion" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Zalina announcement" })).toHaveCount(0);
  await expect(page.getByRole("complementary", { name: "Zalina featured event" })).toHaveCount(0);
});
