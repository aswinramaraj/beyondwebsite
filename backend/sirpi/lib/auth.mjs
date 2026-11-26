/** Google ID-token verification (RS256 against Google's published keys) and the signed session cookie. node:crypto only. */
import { createHmac, createPublicKey, timingSafeEqual, verify as rsaVerify } from 'node:crypto';

const GOOGLE_CERTS = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);
const b64json = (s) => JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));

/** Google's signing keys, cached for as long as Google's Cache-Control says. `fetchJwks` can be swapped in tests. */
export function googleKeys(fetchJwks = async () => {
  const r = await fetch(GOOGLE_CERTS);
  if (!r.ok) throw new Error('google certs ' + r.status);
  const max = /max-age=(\d+)/.exec(r.headers.get('cache-control') || '');
  return { keys: (await r.json()).keys, ttl: max ? +max[1] : 3600 };
}) {
  let cache = null, until = 0;
  return async (kid) => {
    if (!cache || Date.now() > until || !cache.has(kid)) {
      const { keys, ttl } = await fetchJwks();
      cache = new Map(keys.map((k) => [k.kid, createPublicKey({ key: k, format: 'jwk' })]));
      until = Date.now() + ttl * 1000;
    }
    return cache.get(kid);
  };
}

/** Verify a Google Sign-In credential (ID token). Returns { sub, email, name, picture } or throws. */
export async function verifyGoogleIdToken(token, { clientId, keyFor, now = Date.now() / 1000 }) {
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not set');
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('malformed token');
  const [h, p, s] = parts;
  const header = b64json(h);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('unexpected token header');
  const key = await keyFor(header.kid);
  if (!key) throw new Error('unknown signing key');
  const ok = rsaVerify('RSA-SHA256', Buffer.from(`${h}.${p}`), key, Buffer.from(s, 'base64url'));
  if (!ok) throw new Error('bad signature');
  const c = b64json(p);
  if (!ISSUERS.has(c.iss)) throw new Error('bad issuer');
  if (c.aud !== clientId) throw new Error('token is for another app');
  if (typeof c.exp !== 'number' || c.exp < now - 60) throw new Error('token expired');
  if (c.iat && c.iat > now + 300) throw new Error('token from the future');
  if (!c.sub || !c.email || c.email_verified === false) throw new Error('unverified Google account');
  return { sub: String(c.sub), email: String(c.email), name: String(c.name || c.email.split('@')[0]), picture: c.picture ? String(c.picture) : null };
}

/** session token: base64url(JSON {uid, exp}) + '.' + HMAC-SHA256 */
export function sessions(secret) {
  if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters');
  const mac = (data) => createHmac('sha256', secret).update(data).digest('base64url');
  return {
    sign(uid, days = 30) {
      const data = Buffer.from(JSON.stringify({ uid, exp: Math.floor(Date.now() / 1000) + days * 86400 })).toString('base64url');
      return `${data}.${mac(data)}`;
    },
    read(token) {
      const [data, sig] = String(token || '').split('.');
      if (!data || !sig) return null;
      const want = Buffer.from(mac(data)), got = Buffer.from(sig);
      if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
      try {
        const { uid, exp } = b64json(data);
        return exp > Date.now() / 1000 && (Number.isInteger(uid) || (typeof uid === 'string' && uid.length > 0)) ? uid : null;
      } catch { return null; }
    },
  };
}

export function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
