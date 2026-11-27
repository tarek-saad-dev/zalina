// Opt-in interactive browser for an independently isolated Laravel + Next setup.
// This does not start servers, provision fixtures, or attest server-side isolation.
const readline = require('node:readline/promises');

function loopbackOrigin(value, name) {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${name} must be an explicit loopback HTTP origin`); }
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash || !url.port) {
    throw new Error(`${name} must be an explicit loopback HTTP origin with a port`);
  }
  return url.origin;
}

async function main() {
  if (process.env.EVENT_CROSS_APP_ISOLATED !== 'yes') {
    throw new Error('Set EVENT_CROSS_APP_ISOLATED=yes only after completing the isolation checklist');
  }
  const frontend = loopbackOrigin(process.env.EVENT_CROSS_APP_FRONTEND, 'EVENT_CROSS_APP_FRONTEND');
  const backend = loopbackOrigin(process.env.EVENT_CROSS_APP_BACKEND, 'EVENT_CROSS_APP_BACKEND');
  if (frontend === backend) throw new Error('Frontend and backend origins must be distinct');
  const automatic = process.env.EVENT_CROSS_APP_MODE === 'read-only';
  const slug = process.env.EVENT_CROSS_APP_EDITION_SLUG;
  if (automatic && (!slug || !/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(slug))) {
    throw new Error('Read-only mode requires a synthetic published EVENT_CROSS_APP_EDITION_SLUG');
  }
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: automatic });
  try {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    await context.route('**/*', route => {
      let origin;
      try { origin = new URL(route.request().url()).origin; } catch { return route.abort(); }
      return [frontend, backend].includes(origin) ? route.continue() : route.abort();
    });
    if (automatic) {
      // Only GET/HEAD in the read-only gate; no booking creation or payment.
      await context.route('**/*', route => {
        const request = route.request();
        return ['GET', 'HEAD'].includes(request.method()) && [frontend, backend].includes(new URL(request.url()).origin)
          ? route.fallback() : route.abort();
      });
      const assert = require('node:assert/strict');
      for (const locale of ['en', 'ar']) {
        const headers = { 'Accept': 'application/json', 'Accept-Language': locale };
        const get = async path => {
          const response = await context.request.get(backend + '/api/v1' + path, { headers, maxRedirects: 0, timeout: 20000 });
          assert.equal(response.status(), 200, 'Isolated API request failed');
          const envelope = await response.json();
          assert.notEqual(envelope.success, false, 'API envelope indicates failure');
          assert.ok(Object.prototype.hasOwnProperty.call(envelope, 'data'), 'API data missing');
          return envelope.data;
        };
        const edition = await get('/events/editions/' + encodeURIComponent(slug));
        assert.equal(edition.slug, slug);
        assert.equal(edition.availability_state, 'booking_open', 'Synthetic edition must be booking_open');
        assert.equal(edition.purchase_enabled, true);
        assert.ok(Number.isSafeInteger(edition.event_edition_id) && edition.event_edition_id > 0);
        assert.ok(Array.isArray(edition.packages) && edition.packages.length > 0);
        const availability = await get('/events/editions/' + encodeURIComponent(slug) + '/availability');
        assert.equal(availability.sales_enabled, true);
        assert.ok(Number.isSafeInteger(availability.remaining_guest_capacity));
        assert.ok(Array.isArray(availability.packages));
        const announcement = await get('/events/announcement');
        assert.ok(announcement === null || ['card', 'banner'].includes(announcement.type));
        const expectedName = locale === 'ar' ? edition.name_ar : edition.name_en;
        assert.ok(typeof expectedName === 'string' && expectedName.trim());
        for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
          const page = await context.newPage();
          try {
            await page.setViewportSize(viewport);
            const response = await page.goto(frontend + '/' + locale + '/events/' + encodeURIComponent(slug), {waitUntil:'domcontentloaded',timeout:90000});
            assert.equal(response.status(), 200);
            await page.getByRole('heading', {name:expectedName,exact:true}).waitFor({state:'visible',timeout:30000});
            assert.equal(await page.locator('html').getAttribute('dir'), locale === 'ar' ? 'rtl' : 'ltr');
            await page.getByRole('spinbutton').first().waitFor({state:'visible',timeout:30000});
            assert.match(response.headers()['cache-control'] || '', /no-store|private/);
            console.log('PASS actual read-only edition/availability ' + locale + '-' + viewport.width);
          } finally { await page.close(); }
        }
      }
      console.log('PASS read-only cross-app gate. Booking, payment, tickets and preview mutations remain separate.');
      return;
    }
    const page = await context.newPage();
    await page.goto(frontend, { waitUntil: 'domcontentloaded' });
    console.log('Browser open. Use only maintainer-provided synthetic fixtures; see scripts/event-cross-app.md.');
    console.log('Browser requests outside the two configured origins are blocked. Server-side isolation must be enforced separately.');
    const input = readline.createInterface({ input: process.stdin, output: process.stdout });
    try { await input.question('Press Enter to close the browser. '); } finally { input.close(); }
  } finally { await browser.close(); }
}

main().catch(error => { console.error('Cross-app gate failed: ' + (error instanceof Error && /^(Set EVENT_|Read-only mode|EVENT_CROSS_APP_|Frontend and backend)/.test(error.message) ? error.message : 'inspect the isolated environment locally; details omitted to protect capabilities')); process.exitCode = 1; });
