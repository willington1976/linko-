// patch-titleLower.cjs
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./service-account.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function patch() {
  const snap = await db.collection('publications').get();
  let count = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    if (!data.titleLower && data.title) {
      await doc.ref.update({ titleLower: data.title.toLowerCase() });
      console.log('  patched:', data.title);
      count++;
    }
  }
  console.log('Done. Patched:', count);
  process.exit(0);
}

patch().catch((err) => { console.error(err); process.exit(1); });