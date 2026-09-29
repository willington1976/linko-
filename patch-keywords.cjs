const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./service-account.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
function titleToKeywords(title) {
  return [...new Set(title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w.length>=2))];
}
async function patch() {
  const snap = await db.collection('publications').get();
  let n = 0;
  for (const d of snap.docs) {
    const data = d.data();
    if (data.title) {
      const keywords = titleToKeywords(data.title);
      await d.ref.update({ keywords });
      console.log(`OK ${d.id} => [${keywords.join(', ')}]`);
      n++;
    }
  }
  console.log(`Done. ${n} docs patched.`);
  process.exit(0);
}
patch().catch(e=>{console.error(e);process.exit(1);});
