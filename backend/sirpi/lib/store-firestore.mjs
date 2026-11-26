/**
 * Storage on Firebase Firestore (firebase-admin). Interface used by server.mjs:
 *   upsertUser({ sub, email, name, picture }) → user        getUser(id) → user | null
 *   createProblem({ user, month, text, norm, place, max }) → { id }   (throws { status: 429 | 409 })
 *   toggleVote({ problemId, user, month }) → { votes, voted }        (throws { status: 404 | 400 })
 *   list({ month, me, sort, q, limit, offset }) → { items, more }    stats(month) → { problems, votes }
 *
 * Collections (all prefixed, default "sirpi_", so they never mix with other apps in the same Firebase project):
 *   users/{googleSub}            { email, name, picture, createdAt, updatedAt }
 *   problems/{autoId}            { userId, authorName, authorPicture, month, text, norm, place, createdAt, votes }
 *   votes/{problemId}_{userId}   { problemId, userId, month, createdAt }          — one doc per vote = one vote per person
 *   keys/{month}_{sha1(norm)}    { problemId, month }                             — makes "same problem twice" impossible
 *   quota/{month}_{userId}       { count, month, userId }                         — problems posted this month
 *   tallies/{month}              { problems, votes }                              — the counters under the bonfire
 * Posting and voting run in transactions, so counts stay right under concurrent votes.
 *
 * Indexes the queries need (composite, collection "<prefix>problems"):
 *   month ASC, votes DESC, createdAt ASC     (Most votes)
 *   month ASC, createdAt DESC                (Newest, and search)
 * See README.md for the one-line gcloud commands (or follow the link Firestore logs the first time a query runs).
 */
import { createHash } from 'node:crypto';

const fail = (status, error, extra) => Object.assign(new Error(error), { status, extra });

export function firestoreStore(db, FieldValue, prefix = 'sirpi_') {
  const col = (name) => db.collection(prefix + name);
  const inc = (n) => FieldValue.increment(n);
  const keyId = (month, norm) => `${month}_${createHash('sha1').update(norm).digest('hex').slice(0, 24)}`;
  const toItem = (d, voted, me) => {
    const x = d.data();
    return { id: d.id, text: x.text, place: x.place || '', votes: x.votes || 0, voted: voted.has(d.id), mine: !!me && x.userId === me,
      author: x.authorName, picture: x.authorPicture || null, createdAt: x.createdAt };
  };
  const indexHint = (e) => {
    if (e && (e.code === 9 || /FAILED_PRECONDITION|requires an index/i.test(String(e.message)))) {
      console.error('[sirpi] Firestore needs a composite index for this query. Create it with the link below (or see README.md):\n' + e.message);
    }
    throw e;
  };

  return {
    kind: 'firestore',
    async upsertUser({ sub, email, name, picture }) {
      const ref = col('users').doc(sub);
      const now = Date.now();
      const snap = await ref.get();
      await ref.set({ email, name, picture: picture || null, updatedAt: now, ...(snap.exists ? {} : { createdAt: now }) }, { merge: true });
      return { id: sub, name, picture: picture || null };
    },
    async getUser(id) {
      if (typeof id !== 'string' || !id) return null;
      const s = await col('users').doc(id).get();
      return s.exists ? { id, name: s.data().name, picture: s.data().picture || null } : null;
    },
    async createProblem({ user, month, text, norm, place, max }) {
      const quotaRef = col('quota').doc(`${month}_${user.id}`);
      const keyRef = col('keys').doc(keyId(month, norm));
      const tallyRef = col('tallies').doc(month);
      return db.runTransaction(async (tx) => {
        const [quota, key] = await tx.getAll(quotaRef, keyRef);
        if (quota.exists && (quota.data().count || 0) >= max) throw fail(429, `you can post ${max} problems a month — vote for the others!`);
        if (key.exists) throw fail(409, 'someone already posted this one — vote for it instead', { id: key.data().problemId });
        const pRef = col('problems').doc();
        tx.set(pRef, { userId: user.id, authorName: user.name, authorPicture: user.picture || null, month, text, norm, place, createdAt: Date.now(), votes: 0 });
        tx.set(keyRef, { problemId: pRef.id, month });
        tx.set(quotaRef, { count: inc(1), month, userId: user.id }, { merge: true });
        tx.set(tallyRef, { problems: inc(1) }, { merge: true });
        return { id: pRef.id };
      });
    },
    async toggleVote({ problemId, user, month }) {
      const pRef = col('problems').doc(String(problemId));
      const vRef = col('votes').doc(`${problemId}_${user.id}`);
      const tallyRef = col('tallies').doc(month);
      return db.runTransaction(async (tx) => {
        const [p, v] = await tx.getAll(pRef, vRef);
        if (!p.exists || p.data().month !== month) throw fail(404, 'that problem is not in this month’s contest');
        if (p.data().userId === user.id) throw fail(400, 'you can’t vote for your own problem');
        const votes = p.data().votes || 0;
        if (v.exists) {
          tx.delete(vRef);
          tx.update(pRef, { votes: inc(-1) });
          tx.set(tallyRef, { votes: inc(-1) }, { merge: true });
          return { votes: Math.max(0, votes - 1), voted: false };
        }
        tx.create(vRef, { problemId: p.id, userId: user.id, month, createdAt: Date.now() });
        tx.update(pRef, { votes: inc(1) });
        tx.set(tallyRef, { votes: inc(1) }, { merge: true });
        return { votes: votes + 1, voted: true };
      });
    },
    async list({ month, me, sort, q, limit, offset }) {
      // which of this month's problems the viewer voted for
      const voted = new Set();
      if (me) {
        const vs = await col('votes').where('userId', '==', me).where('month', '==', month).limit(2000).get();
        vs.docs.forEach((d) => voted.add(d.data().problemId));
      }
      const base = col('problems').where('month', '==', month);
      if (q) {
        // Firestore has no substring search: scan the month (newest first, capped) and filter here
        const needle = q.toLowerCase();
        const snap = await base.orderBy('createdAt', 'desc').limit(1000).get().catch(indexHint);
        let docs = snap.docs.filter((d) => `${d.data().text} ${d.data().place || ''}`.toLowerCase().includes(needle));
        if (sort !== 'new') docs = docs.sort((a, b) => (b.data().votes || 0) - (a.data().votes || 0) || a.data().createdAt - b.data().createdAt);
        const page = docs.slice(offset, offset + limit + 1);
        return { items: page.slice(0, limit).map((d) => toItem(d, voted, me)), more: page.length > limit };
      }
      const ordered = sort === 'new' ? base.orderBy('createdAt', 'desc') : base.orderBy('votes', 'desc').orderBy('createdAt', 'asc');
      const snap = await ordered.offset(offset).limit(limit + 1).get().catch(indexHint);
      return { items: snap.docs.slice(0, limit).map((d) => toItem(d, voted, me)), more: snap.docs.length > limit };
    },
    async stats(month) {
      const s = await col('tallies').doc(month).get();
      return { problems: Math.max(0, s.exists ? s.data().problems || 0 : 0), votes: Math.max(0, s.exists ? s.data().votes || 0 : 0) };
    },
  };
}
