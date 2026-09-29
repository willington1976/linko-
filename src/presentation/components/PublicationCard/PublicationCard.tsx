// src/presentation/components/PublicationCard/PublicationCard.tsx

import { TTLBadge } from '../TTLBadge/TTLBadge';
import type { Publication } from '../../../domain/entities/Publication';
import styles from './PublicationCard.module.css';

interface PublicationCardProps {
  publication: Publication;
  onClick?: (id: string) => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  empleo:    'Empleo',
  inmuebles: 'Inmuebles',
  articulos: 'Artículos',
  servicios: 'Servicios',
  urgente:   'Urgente',
};

const INTENT_LABEL: Record<string, string> = {
  busco:   'Busco',
  ofrezco: 'Ofrezco',
};

export function PublicationCard({ publication, onClick }: PublicationCardProps) {
  const hasPhoto = publication.photos.length > 0;
  const photo    = publication.photos[0];

  return (
    <article
      className={styles.card}
      onClick={() => onClick?.(publication.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(publication.id)}
      aria-label={publication.title}
    >
      {/* Foto */}
      {hasPhoto && photo && (
        <div className={styles.photoWrapper}>
          <img
            src={photo}
            alt={publication.title}
            className={styles.photo}
            loading="lazy"
          />
        </div>
      )}

      <div className={styles.body}>
        {/* Cabecera: categoría + intent + TTL */}
        <div className={styles.meta}>
          <span className={styles.category}>
            {CATEGORY_LABEL[publication.category] ?? publication.category}
          </span>
          <span className={`${styles.intent} ${styles[publication.intent]}`}>
            {INTENT_LABEL[publication.intent] ?? publication.intent}
          </span>
          <TTLBadge expiresAt={publication.expiresAt} />
        </div>

        {/* Título */}
        <h3 className={styles.title}>{publication.title}</h3>

        {/* Descripción truncada */}
        <p className={styles.description}>{publication.description}</p>

        {/* Precio */}
        {publication.price !== undefined && publication.price > 0 && (
          <p className={styles.price}>
            ${publication.price.toLocaleString('es-CO')} COP
          </p>
        )}

        {/* Footer: autor + ubicación */}
        <div className={styles.footer}>
          <span className={styles.author}>
            {publication.authorVerified && (
              <span className={styles.verified} title="Verificado">✓</span>
            )}
            {publication.authorName}
          </span>
          <span className={styles.location}>📍 {publication.municipality}</span>
        </div>
      </div>
    </article>
  );
}
