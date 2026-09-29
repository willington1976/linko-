// seed.cjs
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const serviceAccount = require('./service-account.json');

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'linko-e1499.firebasestorage.app',
});

const db = getFirestore();

const now = Date.now();
const DAY = 24 * 60 * 60 * 1000;

function titleToKeywords(title) {
  return [
    ...new Set(
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 2),
    ),
  ];
}

const publications = [
  {
    title: 'Vendo moto Honda CB150 2022',
    description: 'Moto en perfecto estado, 15.000 km, SOAT y tecno al dia. Unico dueno.',
    category: 'articulos',
    intent: 'ofrezco',
    department: 'casanare',
    municipality: 'Yopal',
    price: 8500000,
    contactPhone: '3101234567',
    publicationType: 'personal',
    authorId: 'temp-user-001',
    status: 'activa',
    photoURLs: [],
    createdAt: Timestamp.fromMillis(now - 2 * DAY),
    expiresAt: Timestamp.fromMillis(now + 28 * DAY),
    views: 42,
  },
  {
    title: 'Arriendo apartamento en Yopal',
    description: 'Apto 2 habitaciones, sala-comedor, cocina integral, parqueadero. Zona norte.',
    category: 'inmuebles',
    intent: 'ofrezco',
    department: 'casanare',
    municipality: 'Yopal',
    price: 1200000,
    contactPhone: '3209876543',
    publicationType: 'personal',
    authorId: 'temp-user-001',
    status: 'activa',
    photoURLs: [],
    createdAt: Timestamp.fromMillis(now - 1 * DAY),
    expiresAt: Timestamp.fromMillis(now + 29 * DAY),
    views: 18,
  },
  {
    title: 'Se busca conductor con licencia C2',
    description: 'Empresa de transporte busca conductor para ruta Yopal-Aguazul. Contrato directo.',
    category: 'empleo',
    intent: 'busco',
    department: 'casanare',
    municipality: 'Aguazul',
    contactPhone: '3155554433',
    publicationType: 'personal',
    authorId: 'temp-user-002',
    status: 'activa',
    photoURLs: [],
    createdAt: Timestamp.fromMillis(now - 3 * DAY),
    expiresAt: Timestamp.fromMillis(now + 27 * DAY),
    views: 67,
  },
  {
    title: 'Plomero disponible en Tauramena',
    description: 'Servicio de plomeria residencial y comercial. Instalaciones, reparaciones, destapes.',
    category: 'servicios',
    intent: 'ofrezco',
    department: 'casanare',
    municipality: 'Tauramena',
    price: 80000,
    contactPhone: '3002221100',
    publicationType: 'personal',
    authorId: 'temp-user-002',
    status: 'activa',
    photoURLs: [],
    createdAt: Timestamp.fromMillis(now - 4 * DAY),
    expiresAt: Timestamp.fromMillis(now + 26 * DAY),
    views: 11,
  },
  {
    title: 'Vendo nevera Samsung 300L',
    description: 'Nevera 2 puertas, excelente estado, 3 anos de uso. Entrega en Villanueva.',
    category: 'articulos',
    intent: 'ofrezco',
    department: 'casanare',
    municipality: 'Villanueva',
    price: 950000,
    contactPhone: '3118889977',
    publicationType: 'personal',
    authorId: 'temp-user-003',
    status: 'activa',
    photoURLs: [],
    createdAt: Timestamp.fromMillis(now - 5 * DAY),
    expiresAt: Timestamp.fromMillis(now + 25 * DAY),
    views: 29,
  },
  {
    title: 'URGENTE: busco mecanico diesel',
    description: 'Necesito mecanico urgente para camion varado en Paz de Ariporo. Pago inmediato.',
    category: 'urgente',
    intent: 'busco',
    department: 'casanare',
    municipality: 'Paz de Ariporo',
    contactPhone: '3144445566',
    publicationType: 'personal',
    authorId: 'temp-user-003',
    status: 'activa',
    photoURLs: [],
    createdAt: Timestamp.fromMillis(now - 6 * DAY),
    expiresAt: Timestamp.fromMillis(now + 24 * DAY),
    views: 88,
  },
];

async function seed() {
  console.log('Seeding Firestore...');
  const col = db.collection('publications');

  for (const pub of publications) {
    const clean = Object.fromEntries(
      Object.entries(pub).filter(([, v]) => v !== undefined)
    );
    if (clean.title) {
      clean.titleLower = clean.title.toLowerCase();
      clean.keywords = titleToKeywords(clean.title);
    }
    const ref = await col.add(clean);
    console.log(`  + ${ref.id} - ${clean.title}`);
    console.log(`    keywords: [${clean.keywords.join(', ')}]`);
  }

  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
