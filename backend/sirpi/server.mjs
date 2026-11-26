/**
 * Sirpi backend — the monthly Stupid Problem Prize.
 * Node built-ins + firebase-admin. Storage: Firebase Firestore (lib/store-firestore.mjs). The website reaches it
 * through a same-origin proxy: /sirpi-api/* → this server's /api/* (see next.config.mjs), so the session cookie is first-party.
 *
 *   GET  /api/health
 *   GET  /api/config                       → { googleClientId, prize, month, monthLabel, closesAt, maxPerMonth }
 *   GET  /api/me                           → { user | null }
 *   POST /api/auth/google  { credential }  → verifies the Google ID token, sets the session cookie → { user }
 *   POST /api/auth/logout
 *   GET  /api/problems?sort=top|new&q=&limit=&offset=   → { items, more, stats }
 *   POST /api/problems     { text, place } → sign-in required
 *   POST /api/problems/:id/vote            → sign-in required; toggles your vote → { id, votes, voted }
 *
 * Rules: one vote per person per problem; no voting for your own; up to 3 problems per person per month; no duplicates in a month.
 * POSTs must be JSON and carry the header `X-Sirpi: 1` (with the SameSite=Lax cookie this blocks cross-site form posts).
 */
import { createServer } from 'node:http';
import { createStore } from './lib/store.mjs';
import { googleKeys, parseCookies, sessions, verifyGoogleIdToken } from './lib/auth.mjs';

export function createApp(env = process.env, deps = {}) {
  const prod = env.NODE_ENV === 'production';
  const cfg = {
    clientId: env.GOOGLE_CLIENT_ID || '',
    prize: env.PRIZE || '',
    tz: env.CONTEST_TZ || 'Asia/Kolkata',
    secureCookie: env.COOKIE_SECURE ? env.COOKIE_SECURE === '1' : prod,
    maxPerMonth: +(env.MAX_PROBLEMS_PER_MONTH || 3),
  };
  const store = deps.store;
  if (!store) throw new Error('createApp needs a store (see lib/store.mjs)');
  const sess = sessions(env.SESSION_SECRET || (prod ? '' : 'dev-only-insecure-secret-change-me-0123456789'));
  const keyFor = deps.keyFor || googleKeys();
  const COOKIE = 'sirpi_session';

  /* ── contest calendar: the month, in the contest's time zone ── */
  const monthNow = (d = new Date()) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: cfg.tz, year: 'numeric', month: '2-digit' }).formatToParts(d).map((x) => [x.type, x.value]));
    return `${p.year}-${p.month}`;
  };
  /** the instant the month ends in the contest time zone (UTC ms) */
  const closesAt = (month) => {
    const [y, m] = month.split('-').map(Number);
    const guess = Date.UTC(y, m, 1); // midnight UTC on the 1st of next month; shift by the zone's offset at that instant
    const off = (t) => {
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: cfg.tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(t).map((x) => [x.type, x.value]));
      return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - t;
    };
    return guess - off(guess);
  };
  const monthLabel = (month) => new Date(month + '-15T00:00:00Z').toLocaleString('en', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  /* ── small helpers ── */
  const buckets = new Map(); // ip → { tokens, at }
  const allow = (ip, cost = 1, rate = 0.5, burst = 20) => { // ~30 writes / minute per IP
    const now = Date.now() / 1000;
    const b = buckets.get(ip) || { tokens: burst, at: now };
    b.tokens = Math.min(burst, b.tokens + (now - b.at) * rate); b.at = now;
    if (b.tokens < cost) { buckets.set(ip, b); return false; }
    b.tokens -= cost; buckets.set(ip, b); return true;
  };
  const publicUser = (u) => u && { id: u.id, name: u.name, firstName: u.name.split(/\s+/)[0], picture: u.picture };
  const shortName = (name) => { const [a, b] = String(name).trim().split(/\s+/); return b ? `${a} ${b[0]}.` : a; };
  const clean = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
  const send = (res, status, body, headers = {}) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers });
    res.end(JSON.stringify(body));
  };
  const cookie = (value, maxAge) =>
    `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${cfg.secureCookie ? '; Secure' : ''}`;
  const readJson = (req) => new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on('data', (c) => { n += c.length; if (n > 16 * 1024) { reject(Object.assign(new Error('too large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(Object.assign(new Error('bad json'), { status: 400 })); } });
    req.on('error', reject);
  });
  const fail = (status, error) => Object.assign(new Error(error), { status });

  const formatItem = (r) => ({ id: String(r.id), text: r.text, place: r.place, votes: r.votes, voted: !!r.voted, mine: !!r.mine,
    author: { name: shortName(r.author), picture: r.picture }, createdAt: r.createdAt });

  async function handle(req, res) {
    const url = new URL(req.url, 'http://x');
    const path = url.pathname.replace(/\/+$/, '') || '/';
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || '?';
    const uid = sess.read(parseCookies(req.headers.cookie)[COOKIE]);
    const me = uid != null ? await store.getUser(uid) : null;

    if (req.method === 'POST') {
      if (!/application\/json/.test(req.headers['content-type'] || '') || req.headers['x-sirpi'] !== '1') throw fail(403, 'bad request origin');
      if (!allow(ip)) throw fail(429, 'slow down a little');
    }

    if (req.method === 'GET' && path === '/api/health') return send(res, 200, { ok: true });

    if (req.method === 'GET' && path === '/api/config') {
      const month = monthNow();
      return send(res, 200, { googleClientId: cfg.clientId || null, prize: cfg.prize || null, month, monthLabel: monthLabel(month),
        closesAt: new Date(closesAt(month)).toISOString(), maxPerMonth: cfg.maxPerMonth });
    }

    if (req.method === 'GET' && path === '/api/me') return send(res, 200, { user: publicUser(me) });

    if (req.method === 'POST' && path === '/api/auth/google') {
      const { credential } = await readJson(req);
      let g;
      try { g = await verifyGoogleIdToken(credential, { clientId: cfg.clientId, keyFor }); }
      catch (e) { throw fail(401, 'Google sign-in failed: ' + e.message); }
      const u = await store.upsertUser({ sub: g.sub, email: g.email, name: clean(g.name, 80) || 'Sirpi fan', picture: g.picture });
      return send(res, 200, { user: publicUser(u) }, { 'Set-Cookie': cookie(sess.sign(u.id), 30 * 86400) });
    }

    if (req.method === 'POST' && path === '/api/auth/logout') return send(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) });

    if (req.method === 'GET' && path === '/api/problems') {
      const month = monthNow();
      const sort = url.searchParams.get('sort') === 'new' ? 'new' : 'top';
      const limit = Math.min(50, Math.max(1, +url.searchParams.get('limit') || 30));
      const offset = Math.max(0, +url.searchParams.get('offset') || 0);
      const search = clean(url.searchParams.get('q'), 60);
      const [{ items, more }, stats] = await Promise.all([store.list({ month, me: me?.id ?? null, sort, q: search, limit, offset }), store.stats(month)]);
      return send(res, 200, { items: items.map(formatItem), more, stats, month });
    }

    if (req.method === 'POST' && path === '/api/problems') {
      if (!me) throw fail(401, 'sign in with Google to post a problem');
      const body = await readJson(req);
      const text = clean(body.text, 160), place = clean(body.place, 40);
      if (text.length < 8) throw fail(400, 'tell us a little more (at least 8 characters)');
      const month = monthNow();
      const norm = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
      const { id } = await store.createProblem({ user: me, month, text, norm, place, max: cfg.maxPerMonth });
      return send(res, 201, { item: formatItem({ id, text, place, votes: 0, voted: false, mine: true, author: me.name, picture: me.picture, createdAt: Date.now() }) });
    }

    const vm = req.method === 'POST' && /^\/api\/problems\/([A-Za-z0-9_-]{1,40})\/vote$/.exec(path);
    if (vm) {
      if (!me) throw fail(401, 'sign in with Google to vote');
      const r = await store.toggleVote({ problemId: vm[1], user: me, month: monthNow() });
      return send(res, 200, { id: vm[1], ...r });
    }

    throw fail(404, 'not found');
  }

  return async (req, res) => {
    try { await handle(req, res); }
    catch (e) {
      const status = e.status || 500;
      if (status === 500) console.error('[sirpi]', e);
      if (!res.headersSent) send(res, status, { error: status === 500 ? 'something broke on our side' : e.message, ...(e.extra || {}) });
    }
  };
}

// run directly: node server.mjs
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = +(process.env.PORT || 8787);
  if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) { console.error('SESSION_SECRET is required in production'); process.exit(1); }
  if (!process.env.GOOGLE_CLIENT_ID) console.warn('[sirpi] GOOGLE_CLIENT_ID is not set: the site will show the contest read-only (no sign-in, no posting, no voting).');
  const store = await createStore(process.env);
  console.log(`[sirpi] storage: ${store.kind}`);
  createServer(createApp(process.env, { store })).listen(port, process.env.HOST || '127.0.0.1', () => console.log(`[sirpi] backend on http://${process.env.HOST || '127.0.0.1'}:${port}`));
}
