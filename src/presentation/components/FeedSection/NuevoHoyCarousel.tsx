// src/presentation/components/FeedSection/NuevoHoyCarousel.tsx

import { PublicationCard } from '../PublicationCard/PublicationCard';
import type { Publication } from '../../../domain/entities/Publication';
import styles from './FeedSection.module.css';

interface NuevoHoyCarouselProps {
  publications: Publication[];
  onCardClick: (id: string) => void;
}

export function NuevoHoyCarousel({ publications, onCardClick }: NuevoHoyCarouselProps) {
  if (publications.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Nuevo hoy">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Nuevo hoy</h2>
        <span className={styles.sectionSub}>Ultimas 3 horas</span>
      </div>
      <div className={styles.carousel} role="list">
        {publications.map((pub) => (
          <div key={pub.id} className={styles.carouselItem} role="listitem">
            <PublicationCard publication={pub} onClick={onCardClick} />
          </div>
        ))}
      </div>
    </section>
  );
}