// Public, read-only production checks. No credentials, private data, or writes.
'use strict';
const SITE = 'https://zalinaarabianvillage.com';
const API = 'https://api.zalinaarabianvillage.com';
const origins = new Set([SITE, API]);
const assert = require('node:assert/strict');
let failures = 0;
async function request(origin, path, locale = 'en') {
  let url = new URL(path, origin);
  for (let i = 0; i < 4; i++) {
    assert.ok(origins.has(url.origin) && !url.username && !url.password && !url.search && !url.hash, 'Unexpected public URL');
    const response = await fetch(url, {method:'GET', redirect:'manual', signal:AbortSignal.timeout(15000), headers:{'Accept-Language':locale,Accept:path.includes('/api/')?'application/json':'text/html, application/json'}});
    if ([301,302,303,307,308].includes(response.status)) {
      const next = response.headers.get('location');
      if (response.body) await response.body.cancel();
      assert.ok(next, 'Redirect missing location');
      url = new URL(next,url);
      continue;
    }
    return response;
  }
  throw new Error('Redirect limit exceeded');
}
async function check(label, fn) {
  try { const value=await fn(); console.log('PASS '+label); return value; }
  catch (e) { failures++; console.log('FAIL '+label+' — '+(e.cause?.code || (e.name==='AssertionError'? e.message:'network or response error'))); return undefined; }
}
async function ok(origin,path,locale) {
  const response=await request(origin,path,locale);
  console.log('HTTP '+origin+path+' '+response.status);
  if (response.status!==200) { if(response.body) await response.body.cancel(); throw new Error('HTTP status '+response.status); }
  return response;
}
async function data(origin,path,locale) {
  const response=await ok(origin,path,locale);
  if(origin===SITE && path.startsWith('/api/v1/events/')) {
    assert.match(response.headers.get('cache-control')||'', /no-store/i, 'Proxy must not cache Events data');
    assert.equal(response.headers.get('referrer-policy'),'no-referrer','Proxy referrer policy');
    assert.match(response.headers.get('x-robots-tag')||'', /noindex.*nofollow/i,'Proxy robots policy');
    console.log('PASS Events proxy privacy headers '+locale);
  }
  assert.match(response.headers.get('content-type')||'', /application\/json/i, 'Expected JSON');
  const envelope=await response.json();
  assert.ok(envelope && envelope.success!==false && Object.hasOwn(envelope,'data'), 'Invalid API envelope');
  return envelope.data;
}
function announcement(value) {
  if(value===null) return null;
  assert.ok(value && ['card','banner'].includes(value.type),'Invalid announcement type');
  assert.ok(typeof value.title_en==='string' && typeof value.title_ar==='string','Invalid localized titles');
  assert.ok(typeof value.edition_slug==='string' && /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/.test(value.edition_slug),'Invalid public slug');
  assert.equal(value.landing_path,'/events/'+value.edition_slug,'Invalid public landing path');
  return value;
}
async function main() {
  await check('Backend health',async()=>{const r=await ok(API,'/up'); await r.body?.cancel();});
  await check('Backend ping',async()=>{const r=await ok(API,'/api/v1/ping'); await r.body?.cancel();});
  for(const locale of ['en','ar']) {
    const home=await check('Homepage '+locale,async()=>{const r=await ok(SITE,'/'+locale,locale);assert.match(r.headers.get('content-type')||'',/text\/html/i,'Expected HTML'); const html=await r.text();const tag=html.match(/<html\b[^>]*>/i)?.[0]||'';assert.match(tag,new RegExp('\\blang=[\"\']'+locale+'[\"\']','i'),'Incorrect document language');assert.match(tag,new RegExp('\\bdir=[\"\']'+(locale==='ar'?'rtl':'ltr')+'[\"\']','i'),'Incorrect document direction');return html;});
    const direct=await check('Backend announcement '+locale,async()=>announcement(await data(API,'/api/v1/events/announcement',locale)));
    const proxy=await check('Frontend announcement proxy '+locale,async()=>announcement(await data(SITE,'/api/v1/events/announcement',locale)));
    if(direct===null && proxy===null) {
      if(home!==undefined) await check('No stale public Events link '+locale,async()=>{assert.ok(!/<a\b[^>]*\bhref=["'][^"']*\/events\/[^"']+["']/i.test(home),'Unexpected Events link with null announcement');});
      console.log('BLOCKED public edition checks '+locale+': no active announcement');continue;
    }
    if(direct===undefined || proxy===undefined) continue;
    await check('Announcement agreement '+locale,async()=>{assert.equal(direct?.edition_slug,proxy?.edition_slug,'Different edition across API and proxy');assert.equal(direct?.type,proxy?.type,'Different announcement type');});
    if(!direct || !proxy || direct.edition_slug!==proxy.edition_slug) continue;
    if(home!==undefined) await check('Homepage active announcement link '+locale,async()=>{const href='/'+locale+direct.landing_path;const links=Array.from(home.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi),m=>m[1]);assert.ok(links.includes(href)||links.includes(direct.landing_path),'Active announcement link missing');});
    const path='/api/v1/events/editions/'+encodeURIComponent(direct.edition_slug);
    const edition=await check('Public edition '+locale,async()=>{const v=await data(API,path,locale);assert.equal(v?.slug,direct.edition_slug,'Edition mismatch');assert.ok(['sales_not_open','booking_open','sold_out','sales_closed','archived','cancelled'].includes(v.availability_state),'Unexpected edition state');assert.equal(typeof v.purchase_enabled,'boolean','Missing purchase gate');if(!['archived','cancelled'].includes(v.availability_state)){assert.ok(Array.isArray(v.packages),'Missing packages');assert.ok(Number.isSafeInteger(v.remaining_guest_capacity),'Invalid capacity');}return v;});
    await check('Public availability '+locale,async()=>{const v=await data(SITE,path+'/availability',locale);assert.ok(Array.isArray(v?.packages) && Number.isSafeInteger(v.remaining_guest_capacity) && typeof v.sales_enabled==='boolean','Invalid availability response');});
    if(edition) await check('Localized event page '+locale,async()=>{const r=await ok(SITE,'/'+locale+direct.landing_path,locale);assert.match(r.headers.get('content-type')||'',/text\/html/i,'Expected HTML');await r.body?.cancel();});
  }
  console.log('Read-only HTTP checks only; no booking/payment/preview validation performed.');
  if(failures) process.exitCode=1;
}
main().catch(()=>{console.error('Smoke execution failed');process.exitCode=1;});
