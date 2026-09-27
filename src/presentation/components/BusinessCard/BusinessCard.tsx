// src/presentation/components/BusinessCard/BusinessCard.tsx

import type { Business } from '../../../domain/entities/Business';
import styles from './BusinessCard.module.css';

interface BusinessCardProps {
  business: Business;
  onClick?: (id: string) => void;
}

export function BusinessCard({ business, onClick }: BusinessCardProps) {
  return (
    <article
      className={styles.card}
      onClick={() => onClick?.(business.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(business.id)}
      aria-label={business.name}
    >
      <div className={styles.logoWrapper}>
        {business.logo ? (
          <img src={business.logo} alt={business.name} className={styles.logo} loading="lazy" />
        ) : (
          <div className={styles.logoPlaceholder}>
            {business.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.header}>
          <h3 className={styles.name}>{business.name}</h3>
          {business.membershipActive && (
            <span className={styles.memberBadge}>⭐ Miembro</span>
          )}
        </div>
        <p className={styles.description}>{business.description}</p>
        <span className={styles.location}>📍 {business.location}</span>
      </div>
    </article>
  );
}