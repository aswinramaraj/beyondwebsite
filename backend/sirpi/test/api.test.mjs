// npm test — exercises the whole API on the Firestore store (backed by an in-memory test double, test/fake-firestore.mjs) with locally signed "Google" tokens.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { generateKeyPairSync, sign } from 'node:crypto';
import { createApp } from '../server.mjs';
import { firestoreStore } from '../lib/store-firestore.mjs';
import { FakeFirestore, FieldValue } from './fake-firestore.mjs';

const STORES = { firestore: () => firestoreStore(new FakeFirestore(), FieldValue) };

const CLIENT = 'test-client.apps.googleusercontent.com';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const idToken = (claims, { kid = 'k1', key = privateKey } = {}) => {
  const now = Math.floor(Date.now() / 1000);
  const h = b64({ alg: 'RS256', kid, typ: 'JWT' });
  const p = b64({ iss: 'https://accounts.google.com', aud: CLIENT, iat: now, exp: now + 3600, email_verified: true, ...claims });
  return `${h}.${p}.${sign('RSA-SHA256', Buffer.from(`${h}.${p}`), key).toString('base64url')}`;
};

async function start(kind) {
  const app = createApp({ GOOGLE_CLIENT_ID: CLIENT, SESSION_SECRET: 'x'.repeat(40), PRIZE: '₹1' },
    { store: STORES[kind](), keyFor: async (kid) => (kid === 'k1' ? publicKey : undefined) });
  const srv = createServer(app);
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const call = async (path, { method = 'GET', body, cookie, headers = {} } = {}) => {
    const r = await fetch(base + path, { method, headers: { ...(body ? { 'Content-Type': 'application/json', 'X-Sirpi': '1' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
    return { status: r.status, json: await r.json(), cookie: (r.headers.get('set-cookie') || '').split(';')[0] };
  };
  const login = async (sub, name) => (await call('/api/auth/google', { method: 'POST', body: { credential: idToken({ sub, email: `${sub}@x.com`, name }) } })).cookie;
  return { srv, call, login };
}

for (const kind of Object.keys(STORES)) test(`[${kind}] config and health`, async () => {
  const { srv, call } = await start(kind);
  const c = await call('/api/config');
  assert.equal(c.json.googleClientId, CLIENT);
  assert.equal(c.json.prize, '₹1');
  assert.match(c.json.month, /^\d{4}-\d{2}$/);
  assert.ok(Date.parse(c.json.closesAt) > Date.now());
  assert.equal((await call('/api/health')).json.ok, true);
  srv.close();
});

for (const kind of Object.keys(STORES)) test(`[${kind}] Google sign-in: good token signs in; wrong audience, forged signature, expired token are refused`, async () => {
  const { srv, call } = await start(kind);
  const ok = await call('/api/auth/google', { method: 'POST', body: { credential: idToken({ sub: '1', email: 'a@x.com', name: 'Asha Rao' }) } });
  assert.equal(ok.status, 200);
  assert.equal(ok.json.user.name, 'Asha Rao');
  assert.match(ok.cookie, /^sirpi_session=/);
  assert.equal((await call('/api/me', { cookie: ok.cookie })).json.user.firstName, 'Asha');
  const other = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey;
  for (const credential of [idToken({ sub: '1', email: 'a@x.com', aud: 'someone-else' }), idToken({ sub: '1', email: 'a@x.com' }, { key: other }),
    idToken({ sub: '1', email: 'a@x.com', exp: 1000 }), idToken({ sub: '1', email: 'a@x.com' }, { kid: 'nope' }), 'garbage']) {
    assert.equal((await call('/api/auth/google', { method: 'POST', body: { credential } })).status, 401);
  }
  assert.equal((await call('/api/me', { cookie: 'sirpi_session=forged.value' })).json.user, null);
  srv.close();
});

for (const kind of Object.keys(STORES)) test(`[${kind}] posting and voting rules`, async () => {
  const { srv, call, login } = await start(kind);
  const a = await login('a', 'Asha Rao'), b = await login('b', 'Bala K');
  assert.equal((await call('/api/problems', { method: 'POST', body: { text: 'People honk at red lights' } })).status, 401, 'must sign in to post');
  const p1 = await call('/api/problems', { method: 'POST', body: { text: '  People   honk at red lights  ', place: 'Chennai' }, cookie: a });
  assert.equal(p1.status, 201);
  assert.equal(p1.json.item.text, 'People honk at red lights');
  assert.equal(p1.json.item.author.name, 'Asha R.', 'only first name + initial is public');
  assert.equal(JSON.stringify(p1.json).includes('@'), false, 'no emails in responses');
  assert.equal((await call('/api/problems', { method: 'POST', body: { text: 'people HONK at red lights!' }, cookie: b })).status, 409, 'duplicate');
  assert.equal((await call('/api/problems', { method: 'POST', body: { text: 'short' }, cookie: b })).status, 400);
  for (const t of ['Second stupid problem here', 'Third stupid problem here']) assert.equal((await call('/api/problems', { method: 'POST', body: { text: t }, cookie: a })).status, 201);
  assert.equal((await call('/api/problems', { method: 'POST', body: { text: 'Fourth stupid problem here' }, cookie: a })).status, 429, 'max 3 a month');

  const id = p1.json.item.id;
  assert.equal((await call(`/api/problems/${id}/vote`, { method: 'POST', body: {} })).status, 401, 'must sign in to vote');
  assert.equal((await call(`/api/problems/${id}/vote`, { method: 'POST', body: {}, cookie: a })).status, 400, 'no voting for your own');
  const v1 = await call(`/api/problems/${id}/vote`, { method: 'POST', body: {}, cookie: b });
  assert.deepEqual([v1.json.votes, v1.json.voted], [1, true]);
  const v2 = await call(`/api/problems/${id}/vote`, { method: 'POST', body: {}, cookie: b });
  assert.deepEqual([v2.json.votes, v2.json.voted], [0, false], 'voting again takes the vote back');
  await call(`/api/problems/${id}/vote`, { method: 'POST', body: {}, cookie: b });

  const top = await call('/api/problems?sort=top', { cookie: b });
  assert.equal(top.json.items[0].id, id, 'most votes first');
  assert.equal(top.json.items[0].voted, true);
  assert.deepEqual(top.json.stats, { problems: 3, votes: 1 });
  assert.equal((await call('/api/problems?q=honk')).json.items.length, 1, 'search');
  srv.close();
});

for (const kind of Object.keys(STORES)) test(`[${kind}] cross-site guard: POSTs need JSON + X-Sirpi header`, async () => {
  const { srv, call, login } = await start(kind);
  const a = await login('a', 'Asha');
  const r = await call('/api/problems', { method: 'POST', cookie: a, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  assert.equal(r.status, 403);
  srv.close();
});
