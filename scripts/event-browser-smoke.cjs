// Chromium acceptance against the loopback fixture only. Run with next dev, not production.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const base = 'http://127.0.0.1:3000';
const artifacts = 'artifacts/event-browser';
(async () => {
  await fs.mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
      for (const locale of ['en','ar']) {
        const context = await browser.newContext({viewport, locale: locale === 'ar' ? 'ar-EG' : 'en-GB', serviceWorkers: 'block'});
        await context.route('**/*', route => {
          const url = new URL(route.request().url());
          return url.hostname === '127.0.0.1' && ['3000','4187'].includes(url.port) ? route.continue() : route.abort();
        });
        const page = await context.newPage();
        const tag = locale + '-' + viewport.width;
        const ar = locale === 'ar';
        const goto = path => page.goto(base + '/' + locale + path, {waitUntil:'domcontentloaded', timeout:90000});
        const visible = locator => locator.waitFor({state:'visible', timeout:90000});
        try {
          await goto('/events/fixture');
          await visible(page.getByRole('heading', {name: ar ? 'فعالية تجريبية' : 'Fixture event', exact:true}));
          assert.equal(await page.locator('html').getAttribute('dir'), ar ? 'rtl' : 'ltr');
          await visible(page.locator('input[type=number]').first());
          await page.screenshot({path:artifacts+'/'+tag+'-landing.png', fullPage:true});
          // Free booking: no payment initiation.
          await page.locator('input[type=number]').first().fill('1');
          await page.locator('input[name=name]').fill('Test Fixture');
          await page.locator('input[name=email]').fill('fixture@example.invalid');
          await page.locator('input[name=phone]').fill('01000000000');
          await page.getByRole('button',{name:ar?'احجز الآن':'Book now',exact:true}).click();
          await page.waitForURL('**/events/booking/FIXTURE-*',{timeout:90000});
          await visible(page.getByText(ar?'الحالة: مؤكد':'Status: Confirmed',{exact:true}));
          assert.equal(await page.getByRole('button',{name:ar?'المتابعة للدفع':'Continue to payment'}).count(),0);
          await page.screenshot({path:artifacts+'/'+tag+'-free.png',fullPage:true});
          // Positive booking -> mock provider -> generic /booking recovery.
          await goto('/events/fixture');
          await visible(page.locator('input[type=number]').nth(1));
          await page.locator('input[type=number]').nth(1).fill('1');
          await page.locator('input[name=name]').fill('Test Fixture');
          await page.locator('input[name=email]').fill('fixture@example.invalid');
          await page.locator('input[name=phone]').fill('01000000000');
          await page.getByRole('button',{name:ar?'احجز الآن':'Book now',exact:true}).click();
          await page.waitForURL('**/events/booking/FIXTURE-*',{timeout:90000});
          await page.getByRole('button',{name:ar?'المتابعة للدفع':'Continue to payment',exact:true}).click();
          await page.waitForURL(base+'/'+locale+'/booking/FIXTURE-*',{timeout:90000});
          await visible(page.getByText(ar?'صالحة للدخول':'Valid for admission',{exact:true}));
          await page.screenshot({path:artifacts+'/'+tag+'-paid.png',fullPage:true});
          // All three preview scopes; booking buttons must be absent.
          for (const scope of ['landing','card','banner']) {
            const path = scope === 'landing' ? '/events/fixture' : '/events/preview/'+scope;
            await goto(path+'?preview_token=fixture-only-'+scope);
            await visible(page.getByText(scope === 'landing' ? (ar?'معاينة فقط — الحجز غير متاح':'Preview only — booking is disabled') : (ar?'معاينة':'Preview'),{exact:true}));
            assert.equal(await page.getByRole('button',{name:ar?'احجز الآن':'Book now',exact:true}).count(),0);
            await page.screenshot({path:artifacts+'/'+tag+'-preview-'+scope+'.png',fullPage:true});
          }
          console.log('PASS '+tag+' landing, free booking, mock payment return, three previews');
        } catch (error) {
          await page.screenshot({path:artifacts+'/'+tag+'-failure.png',fullPage:true}).catch(()=>{});
          throw error;
        } finally { await context.close(); }
      }
    }
    await require('./event-browser-acceptance.cjs')(browser);
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
