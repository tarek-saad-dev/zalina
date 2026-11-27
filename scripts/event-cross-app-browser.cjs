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
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: false });
  try {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    await context.route('**/*', route => {
      let origin;
      try { origin = new URL(route.request().url()).origin; } catch { return route.abort(); }
      return [frontend, backend].includes(origin) ? route.continue() : route.abort();
    });
    const page = await context.newPage();
    await page.goto(frontend, { waitUntil: 'domcontentloaded' });
    console.log('Browser open. Use only maintainer-provided synthetic fixtures; see scripts/event-cross-app.md.');
    console.log('Browser requests outside the two configured origins are blocked. Server-side isolation must be enforced separately.');
    const input = readline.createInterface({ input: process.stdin, output: process.stdout });
    try { await input.question('Press Enter to close the browser. '); } finally { input.close(); }
  } finally { await browser.close(); }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
