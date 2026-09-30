// src/presentation/components/PublicationCard/PublicationCard.tsx

import { TTLBadge } from '../TTLBadge/TTLBadge';
import type { Publication } from '../../../domain/entities/Publication';
import styles from './PublicationCard.module.css';

interface PublicationCardProps {
  publication: Publication;
  currentUserId?: string;
  onClick?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  empleo:    'Empleo',
  inmuebles: 'Inmuebles',
  articulos: 'Articulos',
  servicios: 'Servicios',
  urgente:   'Urgente',
};

const INTENT_COLOR: Record<string, string> = {
  busco:   styles.intentBusco,
  ofrezco: styles.intentOfrezco,
};

export function PublicationCard({ publication, currentUserId, onClick, onEdit }: PublicationCardProps) {
  const hasPhotos   = publication.photos.length > 0;
  const firstPhoto  = publication.photos[0];
  const extraPhotos = publication.photos.length - 1;
  const initial     = (publication.authorName ?? 'U').charAt(0).toUpperCase();
  const isOwner     = !!currentUserId && currentUserId === publication.authorId;

  return (
    <article
      className={styles.card}
      onClick={() => onClick?.(publication.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(publication.id)}
      aria-label={publication.title}
    >
      {/* Header estilo red social */}
      <div className={styles.header}>
        <div className={styles.avatar}>{initial}</div>
        <div className={styles.headerInfo}>
          <div className={styles.authorRow}>
            <span className={styles.authorName}>{publication.authorName ?? 'Usuario'}</span>
            {publication.authorVerified && (
              <span className={styles.verifiedBadge} title="Verificado">✓</span>
            )}
            {publication.publicationType === 'business' && (
              <span className={styles.bizBadge}>Negocio</span>
            )}
          </div>
          <div className={styles.subRow}>
            <span className={styles.location}>📍 {publication.municipality}</span>
            <span className={styles.dot}>·</span>
            <TTLBadge expiresAt={publication.expiresAt} />
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.intentPill} ${INTENT_COLOR[publication.intent] ?? ''}`}>
            {publication.intent === 'ofrezco' ? 'Ofrezco' : 'Busco'}
          </span>
          {isOwner && (
            <button
              className={styles.editBtn}
              type="button"
              title="Editar publicación"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(publication.id);
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 1 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Foto principal */}
      {hasPhotos && firstPhoto && (
        <div className={styles.photoWrapper}>
          <img
            src={firstPhoto}
            alt={publication.title}
            className={styles.photo}
            loading="lazy"
          />
          {extraPhotos > 0 && (
            <span className={styles.photoCount}>+{String(extraPhotos)} fotos</span>
          )}
        </div>
      )}

      {/* Cuerpo */}
      <div className={styles.body}>
        <div className={styles.categoryRow}>
          <span className={styles.categoryChip}>
            {CATEGORY_LABEL[publication.category] ?? publication.category}
          </span>
          {publication.price !== undefined && publication.price > 0 && (
            <span className={styles.price}>
              ${publication.price.toLocaleString('es-CO')} COP
            </span>
          )}
        </div>

        <h3 className={styles.title}>{publication.title}</h3>
        <p className={styles.description}>{publication.description}</p>
      </div>

      {/* Footer acciones estilo Facebook */}
      <div className={styles.footer}>
        <button className={styles.actionBtn} type="button" onClick={(e) => e.stopPropagation()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          Me interesa
        </button>
        <button className={styles.actionBtn} type="button" onClick={(e) => e.stopPropagation()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Contactar
        </button>
        <button className={styles.actionBtn} type="button" onClick={(e) => e.stopPropagation()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Compartir
        </button>
      </div>
    </article>
  );
}