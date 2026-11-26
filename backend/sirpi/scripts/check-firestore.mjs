// npm run check — connects with the settings in .env and runs the contest's read queries (nothing is written).
// Tells you if the service-account key, Firestore itself or the composite indexes are missing.
import { createStore } from '../lib/store.mjs';

const month = new Date().toISOString().slice(0, 7);
try {
  const store = await createStore(process.env);
  console.log(`storage: ${store.kind}`);
  console.log('tallies:', await store.stats(month));
  for (const sort of ['top', 'new']) {
    const r = await store.list({ month, me: null, sort, q: '', limit: 5, offset: 0 });
    console.log(`${sort === 'top' ? 'Most votes' : 'Newest'} query: OK (${r.items.length} problems)`);
  }
  console.log('\nAll good: the backend can use Firestore.');
  process.exit(0);
} catch (e) {
  console.error('\nFirestore check failed:\n' + (e.message || e));
  if (/index/i.test(String(e.message))) console.error('\n→ Create the composite indexes (README.md → Firestore → Indexes), wait until they say "Enabled", then run this again.');
  if (/PERMISSION_DENIED|Cloud Firestore API has not been used|NOT_FOUND/i.test(String(e.message))) console.error('\n→ Create the Firestore database in the Firebase console (Build → Firestore Database) and check the key belongs to this project.');
  process.exit(1);
}
