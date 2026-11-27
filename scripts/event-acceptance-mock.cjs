// Isolated, in-memory fixture API for manual M9-B browser checks. No upstream calls.
const http = require('node:http');
const host = '127.0.0.1', port = 4187;
const packages = [1, 2].map(id => ({ id, name_en: `Package ${id}`, name_ar: `باقة ${id}`, description_en: null, description_ar: null, guests_per_package: 2, website_price: id === 1 ? '0.00' : '12.50', image_url: null, is_purchasable: true, remaining_units: null, max_purchasable_units: null, is_active: true }));
const edition = { availability_state: 'booking_open', slug: 'fixture', event_edition_id: 1, name_en: 'Fixture event', name_ar: 'فعالية تجريبية', description_en: 'Local fixture', description_ar: 'تجربة محلية', cover_url: null, gallery: [], event_starts_at: '2027-01-01T12:00:00Z', event_ends_at: null, admission_opens_at: null, admission_closes_at: null, sales_opens_at: null, sales_closes_at: null, currency: 'EGP', packages, remaining_guest_capacity: 20, public_sales_enabled: true, purchase_enabled: true };
const announcement = { type: 'card', title_en: 'Fixture announcement', title_ar: 'إعلان تجريبي', description_en: null, description_ar: null, image_url: null, event_edition_id: 1, edition_slug: 'fixture', landing_path: '/events/fixture' };
const bookings = new Map();
const selections = new Map();
function issuedTickets(reference) { return (selections.get(reference) || []).flatMap(item => Array.from({length: item.quantity}, (_, i) => ({ticket_code: `T-${reference}-${item.package_id}-${i+1}`, status:'valid', package_name_en:`Package ${item.package_id}`, package_name_ar:`باقة ${item.package_id}`, guests_per_package:2, valid_from:null, valid_to:null}))); }
// Controls are reachable only on the loopback fixture, never through the site proxy.
let control = {};
let counts = { create: 0, pay: 0, availability: 0 };
function readJson(req, callback) { let body = ''; req.on('data', chunk => { body += chunk; if (body.length > 10000) req.destroy(); }); req.on('end', () => { try { callback(JSON.parse(body || '{}')); } catch { callback({}); } }); }

function send(res, status, data) { res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(status < 400 ? { success: true, data } : { success: false, message: 'Fixture unavailable' })); }
http.createServer((req, res) => {
  const path = new URL(req.url, `http://${host}:${port}`).pathname;
  if (path === '/__fixture' && req.method === 'POST') return readJson(req, input => { control = input; counts = { create: 0, pay: 0, availability: 0 }; send(res, 200, counts); });
  if (path === '/__fixture' && req.method === 'GET') return send(res, 200, counts);
  if (path === '/__fixture/finish-fulfillment' && req.method === 'POST') { control.releaseFulfillment = true; return send(res, 200, counts); }
  if (req.method === 'GET' && path === '/media/assets/draft-fixture') {
    const tokens = new URL(req.url, `http://${host}:${port}`).searchParams.getAll('preview_token');
    if (tokens.length !== 1 || tokens[0] !== 'fixture-only-landing') return send(res, 404, null);
    res.writeHead(200, {'content-type':'image/svg+xml','cache-control':'private, no-store','x-robots-tag':'noindex, nofollow'});
    return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#c9a35c"/></svg>');
  }
  if (req.method === 'GET' && path === '/api/v1/events/announcement') return send(res, 200, control.announcement === 'none' ? null : { ...announcement, type: control.announcement || 'card', title_en: control.title || announcement.title_en });
  if (req.method === 'GET' && path === '/api/v1/events/editions/fixture') {
    if (control.state === 'draft' || control.state === 'feature_disabled') return send(res, 404, null);
    const state = control.state || 'booking_open';
    if (state === 'archived' || state === 'cancelled') return send(res, 200, { availability_state: state, slug: edition.slug, event_edition_id: 1, name_en: edition.name_en, name_ar: edition.name_ar, is_cancelled: state === 'cancelled', public_sales_enabled: true, purchase_enabled: false, packages });
    return send(res, 200, { ...edition, availability_state: state, purchase_enabled: state === 'booking_open' });
  }
  if (req.method === 'GET' && path === '/api/v1/events/editions/fixture/availability') {
    counts.availability++;
    if (control.rateLimit && counts.availability <= control.rateLimit) { res.writeHead(429, { 'content-type': 'application/json', 'cache-control': 'no-store', 'retry-after': '1' }); return res.end(JSON.stringify({ success: false, message: 'Rate limited' })); }
    return send(res, 200, { availability_state: 'booking_open', remaining_guest_capacity: control.capacity ?? 20, sales_enabled: true, packages: packages.map(({ id, remaining_units, max_purchasable_units, is_purchasable }) => ({ id, remaining_units, max_purchasable_units, is_purchasable })) });
  }
  if (req.method === 'POST' && path === '/api/v1/bookings') {
    counts.create++;
    let body = ''; req.on('data', chunk => { body += chunk; if (body.length > 10000) req.destroy(); }); req.on('end', () => { try { const input = JSON.parse(body); counts.lastCreate = input; if (control.rejectPackages) { control.rejectPackages = false; res.writeHead(422, { 'content-type': 'application/json', 'cache-control': 'no-store' }); return res.end(JSON.stringify({ success: false, message: 'Capacity changed', errors: { packages: ['Capacity changed'] } })); } const paid = input.packages.some(item => item.package_id === 2 && item.quantity > 0); const reference = `FIXTURE-${bookings.size + 1}`; const booking = { booking_reference: reference, booking_code: reference, product_type: 'event', status: paid ? 'pending_payment' : 'confirmed', operational_status: null, total: paid ? (input.packages.filter(item => item.package_id === 2).reduce((sum, item) => sum + item.quantity * 1250, 0) / 100).toFixed(2) : '0.00', currency: 'EGP', guests: input.packages.reduce((sum, item) => sum + item.quantity * 2, 0), hold_expires_at: control.expired ? '2000-01-01T00:00:00Z' : null, payment_expires_at: null, valid_from: null, valid_to: null, requires_payment: paid, tickets: [] }; bookings.set(reference, booking); selections.set(reference, input.packages); send(res, 201, booking); } catch { send(res, 400, null); } }); return;
  }
  const match = path.match(/^\/api\/v1\/bookings\/(FIXTURE-\d+)$/);
  if (req.method === 'GET' && match && bookings.has(match[1])) {
    const booking = bookings.get(match[1]);
    if (booking.ticket_fulfillment_status === 'processing' && control.finishOnPoll) {
      counts.fulfillmentPolls = (counts.fulfillmentPolls || 0) + 1;
      if (control.releaseFulfillment && counts.fulfillmentPolls >= 2) {
        booking.ticket_fulfillment_status = 'completed';
        booking.tickets = issuedTickets(match[1]);
      }
    }
    if (control.fulfillment) return send(res, 200, { ...booking, status: 'paid', requires_payment: false, ticket_fulfillment_status: control.fulfillment, tickets: control.fulfillment === 'failed' ? [{ ticket_code: 'INVALID-FIXTURE', status: 'invalidated', package_name_en: 'Package 1', package_name_ar: 'باقة 1', guests_per_package: 2, valid_from: null, valid_to: null }] : [] });
    return send(res, 200, booking);
  }
  // Test-only mock provider. No external requests or credentials.
  const pay = path.match(/^\/api\/v1\/bookings\/(FIXTURE-\d+)\/pay$/);
  if (req.method === 'POST' && pay && bookings.has(pay[1])) {
    counts.pay++;
    const booking = bookings.get(pay[1]);
    if (control.payConflict) { booking.status = 'paid'; booking.requires_payment = false; booking.ticket_fulfillment_status = 'processing'; return send(res, 409, null); }
    if (booking.status !== 'pending_payment' || !booking.requires_payment) return send(res, 409, null);
    const locale = req.headers['accept-language'] === 'ar' ? 'ar' : 'en';
    return send(res, 200, { payment_url: `http://${host}:${port}/mock-pay/${pay[1]}?locale=${locale}` });
  }
  const provider = path.match(/^\/mock-pay\/(FIXTURE-\d+)$/);
  if (req.method === 'GET' && provider && bookings.has(provider[1])) {
    const booking = bookings.get(provider[1]);
    booking.status = 'confirmed'; booking.requires_payment = false; booking.ticket_fulfillment_status = control.finishOnPoll ? 'processing' : 'completed';
    booking.tickets = control.finishOnPoll ? [] : issuedTickets(provider[1]);
    const locale = new URL(req.url, `http://${host}:${port}`).searchParams.get('locale') === 'ar' ? 'ar' : 'en';
    res.writeHead(303, { location: `http://127.0.0.1:3000/${locale}/booking`, 'cache-control': 'no-store' }); return res.end();
  }
  const preview = path.match(/^\/api\/v1\/events\/preview\/(landing|card|banner)$/);
  if (req.method === 'GET' && preview) {
    if (!req.headers['x-event-preview-token']) return send(res, 401, null);
    if (req.headers['x-event-preview-token'] !== 'fixture-only-' + preview[1]) return send(res, 403, null);
    return send(res, 200, preview[1] === 'landing' ? { ...edition, cover_url: control.draftMedia ? '/media/assets/draft-fixture?preview_token=fixture-only-landing' : null, packages: packages.map(p => ({...p,is_purchasable:false})), is_preview: true, preview_scope: 'landing', purchase_enabled: false } : { ...announcement, type: preview[1], is_preview: true, preview_scope: preview[1] });
  }
  send(res, 404, null);
}).listen(port, host, () => process.stdout.write(`Fixture API listening on http://${host}:${port}\n`));
