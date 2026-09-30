// src/presentation/components/BusinessCard/BusinessCard.tsx

import type { Business } from '../../../domain/entities/Business';
import styles from './BusinessCard.module.css';

interface BusinessCardProps {
  business: Business;
  onClick?: (id: string) => void;
}

export function BusinessCard({ business, onClick }: BusinessCardProps) {
  const initial = business.businessName.charAt(0).toUpperCase();
  const isActive = business.membership.status === 'active';

  return (
    <article
      className={styles.card}
      onClick={() => onClick?.(business.businessId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.(business.businessId)}
      aria-label={business.businessName}
    >
      <div className={styles.logoWrapper}>
        {business.logoURL ? (
          <img
            src={business.logoURL}
            alt={business.businessName}
            className={styles.logo}
            loading="lazy"
          />
        ) : (
          <div className={styles.logoPlaceholder}>{initial}</div>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.header}>
          <h3 className={styles.name}>{business.businessName}</h3>
          {isActive && <span className={styles.memberBadge}>Miembro</span>}
        </div>
        <p className={styles.description}>{business.description}</p>
        <span className={styles.location}>{business.municipality}, {business.department}</span>
      </div>
    </article>
  );
}