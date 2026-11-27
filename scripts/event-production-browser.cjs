// Live public UI only. Never submit a booking or initiate payment.
'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const SITE = 'https://zalinaarabianvillage.com', API = 'https://api.zalinaarabianvillage.com';
const allowedOrigins = new Set([SITE, API]);
const artifact = 'artifacts/event-production-browser';
const cents = value => {
  assert.match(value,/^\d+(?:\.\d{1,2})?$/);
  const [whole,fraction=''] = value.split('.');
  const result=Number(whole)*100+Number(fraction.padEnd(2,'0'));
  assert.ok(Number.isSafeInteger(result));
  return result;
};
const money = value => (value/100).toFixed(2);
async function get(context,path,locale) {
  const r=await context.request.get(API+'/api/v1'+path,{headers:{Accept:'application/json','Accept-Language':locale},maxRedirects:0,timeout:20000});
  assert.equal(r.status(),200,'Public API request failed');
  const envelope=await r.json();
  assert.ok(envelope && envelope.success!==false && Object.hasOwn(envelope,'data'));
  return envelope.data;
}
(async()=>{
  await fs.mkdir(artifact,{recursive:true});
  const browser=await chromium.launch({headless:true});
  try {
    for (const locale of ['en','ar']) {
      const ar=locale==='ar';
      for (const viewport of [{width:1440,height:900},{width:390,height:844}]) {
        const tag=locale+'-'+viewport.width;
        const context=await browser.newContext({viewport,locale:ar?'ar-EG':'en-GB',serviceWorkers:'block'});
        let blockedWrites=0;
        await context.route('**/*',route=>{
          const req=route.request(), u=new URL(req.url());
          if (!['GET','HEAD'].includes(req.method())) { blockedWrites++; return route.abort(); }
          if (!allowedOrigins.has(u.origin) || u.username || u.password || /\/(?:bookings?|payments?|tickets?|preview)(?:\/|$)/i.test(u.pathname) || u.searchParams.has('preview_token')) return route.abort();
          return route.continue();
        });
        if (typeof context.routeWebSocket==='function') await context.routeWebSocket('**/*', ws=>ws.close());
        const page=await context.newPage();
        try {
          const ann=await get(context,'/events/announcement',locale);
          assert.ok(ann && ['card','banner'].includes(ann.type),'No active public announcement');
          assert.match(ann.edition_slug,/^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/);
          assert.equal(ann.landing_path,'/events/'+ann.edition_slug);
          const event=await get(context,'/events/editions/'+ann.edition_slug,locale);
          const availability=await get(context,'/events/editions/'+ann.edition_slug+'/availability',locale);
          assert.equal(event.availability_state,'booking_open');
          assert.equal(event.purchase_enabled,true);
          assert.equal(availability.sales_enabled,true);
          const response=await page.goto(SITE+'/'+locale,{waitUntil:'domcontentloaded',timeout:60000});
          assert.equal(response.status(),200);
          const link=page.getByRole('link',{name:ar?'اكتشف الفعالية':'Explore event',exact:true});
          await link.waitFor({state:'visible',timeout:30000});
          assert.equal(new URL(await link.getAttribute('href'),SITE).pathname,'/'+locale+ann.landing_path);
          const feature=page.locator('[data-event-announcement="'+ann.type+'"]');
          await feature.waitFor({state:'visible',timeout:30000});
          await page.waitForFunction(()=>document.querySelectorAll('div.fixed.inset-0[class*="z-[9999]"]').length===0,null,{timeout:30000});
          assert.equal(await page.locator('[data-event-announcement]').count(),1,'Duplicate announcement');
          assert.equal(await page.locator((ann.type==='card'?'.lux-hero-event-slot':'.lux-hero-event-banner')+' [data-event-announcement]').count(),1,'Incorrect announcement placement');
          assert.ok(await feature.evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=-1&&r.right<=innerWidth+1;}),'Announcement outside screen width');
          const copy=await page.locator('.lux-hero-copy').boundingBox(),box=await feature.boundingBox();
          assert.ok(copy&&box,'Hero layout missing');
          if(ann.type==='card'&&viewport.width===1440) assert.ok(ar?box.x+box.width<=copy.x+1:copy.x+copy.width<=box.x+1,'Hero/card overlap');
          else if(ann.type==='card') assert.ok(box.y>=copy.y+copy.height-1,'Mobile card overlap');
          else assert.ok(box.y+box.height<=copy.y+1,'Banner overlap');
          if(ann.image_url) await feature.locator('img').evaluate(img=>img.decode());
          const primary=feature.getByRole('link',{name:ar?'احجز الآن':'Book now',exact:true});
          await primary.waitFor({state:'visible',timeout:15000});
          assert.equal(new URL(await primary.getAttribute('href'),SITE).hash,'#event-packages');
          await primary.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}));
          assert.ok(await primary.evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===el||el.contains(hit);}), 'Announcement CTA obscured');
          await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
          await page.screenshot({path:artifact+'/'+tag+'-announcement.png',animations:'disabled'});
          if(viewport.width===390) await feature.screenshot({path:artifact+'/'+tag+'-announcement-detail.png',animations:'disabled'});
          console.log('PASS LIVE ANNOUNCEMENT '+ann.type+' '+tag);
          await page.goto(SITE+'/'+locale+ann.landing_path,{waitUntil:'domcontentloaded',timeout:60000});
          await page.getByRole('heading',{name:ar?event.name_ar:event.name_en,exact:true}).waitFor({state:'visible',timeout:30000});
          assert.equal(await page.locator('html').getAttribute('lang'),locale);
          assert.equal(await page.locator('html').getAttribute('dir'),ar?'rtl':'ltr');
          assert.equal(await page.locator('main h1').count(),1);
          const buy=page.getByRole('button',{name:ar?'احجز الآن':'Book now',exact:true});
          const controls=page.getByRole('spinbutton');
          await controls.first().waitFor({state:'visible',timeout:30000});
          assert.ok(await buy.isDisabled(),'Empty cart must be disabled');
          let remaining=availability.remaining_guest_capacity, guests=0,total=0,count=0;
          const selected=[];
          for(const p of event.packages) {
            const a=availability.packages.find(a=>a.id===p.id);
            if(!p.is_active||!p.is_purchasable||!a?.is_purchasable||p.guests_per_package>remaining||a.remaining_units===0||a.max_purchasable_units===0)continue;
            const input=page.getByRole('spinbutton',{name:(ar?'كمية ':'Quantity for ')+(ar?p.name_ar:p.name_en),exact:true});
            await input.waitFor({state:'visible',timeout:15000});
            assert.ok(await input.evaluate(el=>el.getBoundingClientRect().height>=44),'Quantity touch target too small');
            await input.fill('1');
            selected.push({p,input});
            guests+=p.guests_per_package; remaining-=p.guests_per_package; total+=cents(p.website_price); count++;
            if(count===2)break;
          }
          assert.ok(count>0,'No selectable package');
          const expected=(ar?'تقدير الضيوف':'Estimated guests')+': '+guests+' · '+(ar?'الإجمالي التقديري':'Estimated total')+': '+money(total)+' '+event.currency;
          await page.getByText(expected,{exact:true}).waitFor({state:'visible',timeout:15000});
          assert.ok(await buy.isEnabled(),'Valid cart must be enabled');
          assert.equal(await page.locator('input[name=email]').getAttribute('autocomplete'),'email');
          assert.equal(await page.locator('input[name=phone]').getAttribute('autocomplete'),'tel');
          assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+2),'Horizontal page overflow');
          await page.screenshot({path:artifact+'/'+tag+'-cart.png',fullPage:true});
          const first=selected[0];
          await first.input.fill(String(Math.floor(availability.remaining_guest_capacity/first.p.guests_per_package)+1));
          await page.getByText(ar?'يرجى تعديل الكميات حسب السعة المتاحة.':'Please adjust quantities to fit the available capacity.',{exact:true}).waitFor({state:'visible',timeout:15000});
          assert.ok(await buy.isDisabled(),'Over-capacity cart must be disabled');
          for(const {input} of selected) await input.fill('0');
          assert.ok(await buy.isDisabled(),'Cleared cart must be disabled');
          // Only public images from approved origins; inspect actual load state.
          const images=page.locator('main img');
          let loaded=0,failed=0;
          for(let i=0;i<await images.count();i++){
            const img=images.nth(i);
            await img.scrollIntoViewIfNeeded();
            try { await img.evaluate(el=>el.decode()); loaded++; } catch { failed++; }
          }
          console.log('PUBLIC MEDIA '+tag+' loaded='+loaded+' failed='+failed);
          assert.equal(failed,0,'Public event image failed to decode');
          assert.equal(blockedWrites,0,'Unexpected mutation request was blocked');
          console.log('PASS LIVE UI '+tag+' packages_selected='+count+' guests='+guests+' total='+money(total)+' '+event.currency+'; no booking submitted');
        } catch(error) {
          await page.screenshot({path:artifact+'/'+tag+'-failure.png',fullPage:true}).catch(()=>{});
          console.error('FAIL LIVE UI '+tag+' '+(error.name==='AssertionError'?error.message:'browser timeout or unavailable public content'));
          process.exitCode=1;
        } finally { await context.close(); }
      }
    }
  } finally { await browser.close(); }
})().catch(()=>{console.error('Live browser gate failed');process.exitCode=1;});
