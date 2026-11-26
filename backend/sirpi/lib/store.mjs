/** The backend's storage: Firebase Firestore (firebase-admin). Settings come from .env — see README.md → Firestore. */
import { readFileSync } from 'node:fs';
import { firestoreStore } from './store-firestore.mjs';

export async function createStore(env = process.env) {
  const { initializeApp, cert, applicationDefault } = await import('firebase-admin/app');
  const { getFirestore, FieldValue } = await import('firebase-admin/firestore');
  // a service-account key file (Firebase console → Project settings → Service accounts → Generate new private key),
  // or Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS / running on Google Cloud)
  let key = null;
  if (env.FIREBASE_SERVICE_ACCOUNT) {
    try { key = JSON.parse(readFileSync(env.FIREBASE_SERVICE_ACCOUNT, 'utf8')); }
    catch (e) { throw new Error(`the Firestore service-account key "${env.FIREBASE_SERVICE_ACCOUNT}" could not be read (${e.code || e.message}). See README.md → Firestore.`); }
  }
  const app = initializeApp({ credential: key ? cert(key) : applicationDefault(), projectId: env.FIREBASE_PROJECT_ID || key?.project_id }, 'sirpi');
  const db = getFirestore(app, env.FIRESTORE_DATABASE || '(default)');
  return firestoreStore(db, FieldValue, env.FIRESTORE_PREFIX ?? 'sirpi_');
}
