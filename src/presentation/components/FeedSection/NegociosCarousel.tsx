// src/presentation/components/FeedSection/NegociosCarousel.tsx

import { BusinessCard } from '../BusinessCard/BusinessCard';
import type { Business } from '../../../domain/entities/Business';
import styles from './FeedSection.module.css';

interface NegociosCarouselProps {
  businesses: Business[];
  onCardClick: (id: string) => void;
}

export function NegociosCarousel({ businesses, onCardClick }: NegociosCarouselProps) {
  if (businesses.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Negocios cerca">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Negocios cerca</h2>
        <span className={styles.sectionSub}>Con membresia activa</span>
      </div>
      <div className={styles.carousel} role="list">
        {businesses.map((biz) => (
          <div key={biz.businessId} className={styles.carouselItem} role="listitem">
            <BusinessCard business={biz} onClick={onCardClick} />
          </div>
        ))}
      </div>
    </section>
  );
}