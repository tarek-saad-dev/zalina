// Additional acceptance scenarios against the loopback fixture only.
const assert = require('node:assert/strict');
module.exports = async function acceptance(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.hostname === '127.0.0.1' && ['3000', '4187'].includes(url.port) ? route.continue() : route.abort();
  });
  const page = await context.newPage();
  const fixture = 'http://127.0.0.1:4187/__fixture';
  const control = async value => { const r = await context.request.post(fixture, { data: value }); assert.equal(r.status(), 200); };
  const counts = async () => (await (await context.request.get(fixture)).json()).data;
  const goto = path => page.goto('http://127.0.0.1:3000/en' + path, { waitUntil: 'domcontentloaded', timeout: 90000 });
  const text = (value) => page.getByText(value, { exact: true });
  const absent = async locator => assert.equal(await locator.count(), 0);
  const fill = async () => { await page.locator('input[name=name]').fill('Test Fixture'); await page.locator('input[name=email]').fill('fixture@example.invalid'); await page.locator('input[name=phone]').fill('01000000000'); };
  try {
    for (const [mode, title] of [['none', null], ['card', 'Fixture announcement'], ['banner', 'Replacement banner'], ['none', null]]) {
      await control({ announcement: mode, title: title || undefined });
      await goto('/');
      if (title) await text(title).waitFor({ state: 'visible', timeout: 90000 });
      else await absent(text('Fixture announcement'));
      if (mode !== 'banner') await absent(text('Replacement banner'));
    }
    for (const [state, label] of [['sales_not_open','Sales have not opened'], ['booking_open','Booking open'], ['sold_out','Sold out'], ['sales_closed','Sales closed'], ['archived','Event archived'], ['cancelled','Event cancelled']]) {
      await control({ state }); await goto('/events/fixture'); await text(label).waitFor({ state: 'visible', timeout: 90000 });
      if (state === 'archived' || state === 'cancelled') await absent(text('Package 1'));
      if (state !== 'booking_open') await absent(page.getByRole('button', { name: 'Book now', exact: true }));
    }
    for (const state of ['draft', 'feature_disabled']) { await control({ state }); assert.equal((await goto('/events/fixture')).status(), 404); }
    await control({});
    for (const path of ['/events/preview/card', '/events/preview/card?preview_token=invalid', '/events/preview/card?preview_token=fixture-only-banner', '/events/fixture?preview_token=invalid', '/events/fixture?preview_token=fixture-only-landing&preview_token=invalid', '/events/preview/card?preview_token=fixture-only-card&preview_token=invalid']) {
      const response = await goto(path); assert.equal(response.status(), 404, path);
    }
    const preview = await goto('/events/preview/card?preview_token=fixture-only-card');
    await text('Preview').waitFor({ state: 'visible', timeout: 90000 });
    assert.match((await page.locator('meta[name=robots]').getAttribute('content')), /noindex.*nofollow/);
    assert.equal(await page.locator('meta[name=referrer]').getAttribute('content'), 'no-referrer');
    assert.match(preview.headers()['cache-control'] || '', /no-store|private/);
    await absent(page.getByRole('link', { name: 'Explore event' }));
    const proxy = await context.request.get('http://127.0.0.1:3000/api/v1/events/preview/card', { headers: { 'X-Event-Preview-Token': 'fixture-only-card' } });
    assert.equal(proxy.status(), 200); assert.match(proxy.headers()['cache-control'] || '', /no-store/);
    assert.equal(proxy.headers()['referrer-policy'], 'no-referrer');
    await control({ rejectPackages: true }); await goto('/events/fixture');
    await page.locator('input[type=number]').first().fill('1'); await page.locator('input[type=number]').nth(1).fill('2'); await fill();
    await text('Estimated guests: 6 · Estimated total: 25.00 EGP').waitFor({ state: 'visible', timeout: 90000 });
    await page.getByRole('button', { name: 'Book now', exact: true }).click();
    await text('Availability changed or some details are invalid. Please review your selection.').waitFor({ state: 'visible', timeout: 90000 });
    let seen = await counts(); assert.equal(seen.create, 1); assert.ok(seen.availability >= 3);
    assert.deepEqual(seen.lastCreate, { product_type:'event', event_edition_id:1, packages:[{package_id:1,quantity:1},{package_id:2,quantity:2}], guest_name:'Test Fixture', guest_email:'fixture@example.invalid', guest_phone:'01000000000' });
    await page.getByRole('button', { name: 'Book now', exact: true }).click();
    await page.waitForURL('**/events/booking/FIXTURE-*', { timeout: 90000 });
    await text('Confirmed total: 25.00 EGP').waitFor({ state: 'visible', timeout: 90000 });
    seen = await counts(); assert.equal(seen.create, 2); assert.equal(seen.pay, 0);
    await control({ rateLimit: 2 }); await goto('/events/fixture');
    const refresh = page.getByRole('button', { name: 'Refresh availability' });
    const waitCount = async expected => {
      const until = Date.now() + 15000;
      while (Date.now() < until) {
        const seen = (await counts()).availability;
        if (seen === expected) return;
        assert.ok(seen < expected, 'Unexpected duplicate availability request: ' + seen);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      assert.equal((await counts()).availability, expected);
    };
    // Wait for hydration and each actual rate-limited response, not arbitrary sleeps.
    await waitCount(1);
    for (let expected = 2; expected <= 3; expected++) {
      await refresh.waitFor({ state: 'visible', timeout: 15000 });
      await text('Unable to refresh availability. Please try again later.').waitFor({ state: 'visible', timeout: 15000 });
      assert.equal((await counts()).availability, expected - 1);
      await refresh.click({ timeout: 15000 }); // Playwright waits for the cooldown-disabled button.
      await waitCount(expected);
    }
    await page.locator('input[type=number]').first().waitFor({ state: 'visible', timeout: 15000 }); assert.equal((await counts()).availability, 3);
    await control({ expired: true }); await goto('/events/fixture'); await page.locator('input[type=number]').nth(1).fill('1'); await fill(); await page.getByRole('button', { name:'Book now', exact:true }).click(); await page.waitForURL('**/events/booking/FIXTURE-*', { timeout:90000 }); await text('Status: Awaiting payment').waitFor({ state:'visible', timeout:90000 }); await absent(page.getByRole('button', { name:'Continue to payment' })); assert.equal((await counts()).pay, 0);
    await page.goto(page.url() + '?success=true', { waitUntil:'domcontentloaded' }); await text('Status: Awaiting payment').waitFor({ state:'visible', timeout:90000 }); await absent(text('Status: Confirmed'));
    await control({ payConflict: true }); await goto('/events/fixture'); await page.locator('input[type=number]').nth(1).fill('1'); await fill(); await page.getByRole('button', { name:'Book now', exact:true }).click(); await page.waitForURL('**/events/booking/FIXTURE-*', { timeout:90000 }); await page.getByRole('button', { name:'Continue to payment' }).click(); await text('Your tickets are being prepared.').waitFor({ state:'visible', timeout:90000 }); await absent(page.getByRole('button', { name:'Continue to payment' })); assert.equal((await counts()).pay, 1);
    const bookingPath = new URL(page.url()).pathname.replace(/^\/en/, '');
    await control({ fulfillment: 'failed' }); await goto(bookingPath + '?success=true');
    await text('Ticket fulfillment failed. Please contact support for help.').waitFor({ state:'visible', timeout:90000 });
    await text('Invalidated — not valid for admission').waitFor({ state:'visible', timeout:90000 });
    await absent(text('Valid for admission')); await absent(page.getByRole('button', { name:'Continue to payment' })); assert.equal((await counts()).pay, 0);
    console.log('PASS advanced loopback acceptance: announcements, states, preview, mixed capacity race, repeated 429, expiry and 409');
  } catch (error) { await page.screenshot({ path:'artifacts/event-browser/advanced-failure.png', fullPage:true }).catch(() => {}); throw error; }
  finally { await context.close(); }
};
