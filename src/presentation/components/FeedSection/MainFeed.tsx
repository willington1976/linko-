// src/presentation/components/FeedSection/MainFeed.tsx

import { PublicationCard } from '../PublicationCard/PublicationCard';
import type { Publication } from '../../../domain/entities/Publication';
import styles from './FeedSection.module.css';

interface MainFeedProps {
  publications: Publication[];
  loading: boolean;
  error: string | null;
  onCardClick: (id: string) => void;
}

export function MainFeed({ publications, loading, error, onCardClick }: MainFeedProps) {
  if (loading) {
    return (
      <div className={styles.feedList}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.skeleton} aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (publications.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>🔭</span>
        No hay publicaciones activas en este momento.
      </div>
    );
  }

  return (
    <div className={styles.feedList}>
      <h2 className={styles.feedListTitle}>Publicaciones recientes</h2>
      {publications.map((pub) => (
        <PublicationCard key={pub.id} publication={pub} onClick={onCardClick} />
      ))}
    </div>
  );
}