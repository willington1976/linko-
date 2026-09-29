// src/presentation/pages/PublicationDetailPage/PublicationDetailPage.tsx

import { useState, useEffect } from 'react';
import { fetchPublicationById } from '../../../infrastructure/repositories/PublicationRepository';
import { TTLBadge } from '../../components/TTLBadge/TTLBadge';
import type { Publication } from '../../../domain/entities/Publication';
import styles from './PublicationDetailPage.module.css';

interface PublicationDetailPageProps {
  publicationId: string;
  onBack: () => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  empleo: 'Empleo',
  inmuebles: 'Inmuebles',
  articulos: 'Articulos',
  servicios: 'Servicios',
  urgente: 'Urgente',
};

export function PublicationDetailPage({ publicationId, onBack }: PublicationDetailPageProps) {
  const [pub, setPub] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchPublicationById(publicationId)
      .then((p) => { setPub(p); setLoading(false); })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Error al cargar.');
        setLoading(false);
      });
  }, [publicationId]);

  if (loading) return <div className={styles.loading}>Cargando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!pub) return <div className={styles.error}>Publicacion no encontrada.</div>;

  const whatsappUrl =
    'https://wa.me/?text=' +
    encodeURIComponent('Hola, vi tu publicacion "' + pub.title + '" en Linko');

  function handleWhatsApp() {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <main className={styles.page}>
      <button className={styles.backBtn} onClick={onBack} aria-label="Volver">
        Volver
      </button>

      {pub.photos.length > 0 && (
        <div className={styles.gallery}>
          <img
            src={pub.photos[photoIdx]}
            alt={pub.title}
            className={styles.mainPhoto}
          />
          {pub.photos.length > 1 && (
            <div className={styles.thumbs}>
              {pub.photos.map((url, i) => (
                <button
                  key={url}
                  className={i === photoIdx ? styles.thumbActive : styles.thumb}
                  onClick={() => setPhotoIdx(i)}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.meta}>
          <span className={styles.category}>
            {CATEGORY_LABEL[pub.category] ?? pub.category}
          </span>
          <span className={styles.intent}>
            {pub.intent === 'ofrezco' ? 'Ofrezco' : 'Busco'}
          </span>
          <TTLBadge expiresAt={pub.expiresAt} />
        </div>

        <h1 className={styles.title}>{pub.title}</h1>

        {pub.price !== undefined && pub.price > 0 && (
          <p className={styles.price}>
            {pub.price.toLocaleString('es-CO') + ' COP'}
          </p>
        )}

        <p className={styles.description}>{pub.description}</p>

        <div className={styles.author}>
          <span className={styles.authorName}>{pub.authorName}</span>
          <span className={styles.location}>{pub.municipality}</span>
        </div>

        <button
          className={styles.whatsappBtn}
          onClick={handleWhatsApp}
          type="button"
        >
          Contactar por WhatsApp
        </button>
      </div>
    </main>
  );
}
