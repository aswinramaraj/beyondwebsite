/**
 * A tiny in-memory stand-in for the parts of firebase-admin's Firestore that lib/store-firestore.mjs uses:
 * collection/doc refs (get, set + merge, update, delete, create), where('==') / orderBy / offset / limit queries,
 * FieldValue.increment and runTransaction (reads first, writes buffered and applied only if the function succeeds).
 * It lets the API tests run the Firestore store without a Google project. Not a general Firestore emulator.
 */
import { randomUUID } from 'node:crypto';

const INC = Symbol('increment');
export const FieldValue = { increment: (n) => ({ [INC]: n }) };

function apply(prev, data, merge) {
  const out = merge && prev ? { ...prev } : {};
  for (const [k, v] of Object.entries(data)) out[k] = v && typeof v === 'object' && INC in v ? (prev?.[k] || 0) + v[INC] : v;
  return out;
}
const snap = (ref, data) => ({ id: ref.id, ref, exists: data !== undefined, data: () => (data === undefined ? undefined : structuredClone(data)) });

export class FakeFirestore {
  constructor() { this.docs = new Map(); } // "collection/id" → data
  collection(name) { return new Query(this, name); }
  async runTransaction(fn) {
    const writes = [];
    const tx = {
      get: (ref) => ref.get(),
      getAll: (...refs) => Promise.all(refs.map((r) => r.get())),
      set: (ref, d, o) => { writes.push(() => ref._set(d, o)); },
      update: (ref, d) => { writes.push(() => ref._update(d)); },
      delete: (ref) => { writes.push(() => ref._delete()); },
      create: (ref, d) => { writes.push(() => ref._create(d)); },
    };
    const result = await fn(tx);
    writes.forEach((w) => w());
    return result;
  }
}

class DocRef {
  constructor(db, col, id) { this.db = db; this.col = col; this.id = id; this.key = `${col}/${id}`; }
  async get() { return snap(this, this.db.docs.get(this.key)); }
  async set(d, o) { this._set(d, o); }
  async update(d) { this._update(d); }
  async delete() { this._delete(); }
  async create(d) { this._create(d); }
  _set(d, o) { this.db.docs.set(this.key, apply(this.db.docs.get(this.key), d, o?.merge)); }
  _update(d) { if (!this.db.docs.has(this.key)) throw Object.assign(new Error('NOT_FOUND'), { code: 5 }); this._set(d, { merge: true }); }
  _delete() { this.db.docs.delete(this.key); }
  _create(d) { if (this.db.docs.has(this.key)) throw Object.assign(new Error('ALREADY_EXISTS'), { code: 6 }); this._set(d); }
}

class Query {
  constructor(db, col, filters = [], orders = [], off = 0, lim = Infinity) { Object.assign(this, { db, col, filters, orders, off, lim }); }
  doc(id = randomUUID().replace(/-/g, '').slice(0, 20)) { return new DocRef(this.db, this.col, id); }
  where(f, op, v) { if (op !== '==') throw new Error('fake supports == only'); return new Query(this.db, this.col, [...this.filters, [f, v]], this.orders, this.off, this.lim); }
  orderBy(f, dir = 'asc') { return new Query(this.db, this.col, this.filters, [...this.orders, [f, dir]], this.off, this.lim); }
  offset(n) { return new Query(this.db, this.col, this.filters, this.orders, n, this.lim); }
  limit(n) { return new Query(this.db, this.col, this.filters, this.orders, this.off, n); }
  async get() {
    let rows = [...this.db.docs].filter(([k]) => k.startsWith(this.col + '/')).map(([k, d]) => [k.slice(this.col.length + 1), d])
      .filter(([, d]) => this.filters.every(([f, v]) => d[f] === v));
    rows.sort((a, b) => { for (const [f, dir] of this.orders) { const x = a[1][f], y = b[1][f]; if (x !== y) return (x < y ? -1 : 1) * (dir === 'desc' ? -1 : 1); } return 0; });
    rows = rows.slice(this.off, this.off + this.lim);
    return { docs: rows.map(([id, d]) => snap(new DocRef(this.db, this.col, id), d)), get size() { return rows.length; } };
  }
}
