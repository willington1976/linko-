// src/presentation/pages/HomePage/HomePage.tsx

import { useState, useCallback } from 'react';
import { useFeed } from '../../../application/hooks/useFeed';
import { NuevoHoyCarousel } from '../../components/FeedSection/NuevoHoyCarousel';
import { NegociosCarousel } from '../../components/FeedSection/NegociosCarousel';
import { MainFeed } from '../../components/FeedSection/MainFeed';
import { FAB } from '../../components/FAB/FAB';
import type { PublicationCategory } from '../../../domain/entities/Publication';
import styles from './HomePage.module.css';

const CATEGORIES: { id: PublicationCategory | 'todas'; label: string }[] = [
  { id: 'todas',     label: 'Todas' },
  { id: 'empleo',    label: 'Empleo' },
  { id: 'inmuebles', label: 'Inmuebles' },
  { id: 'articulos', label: 'Articulos' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'urgente',   label: 'Urgente' },
];

interface HomePageProps {
  currentUserId?:     string;
  onPublicationClick: (id: string) => void;
  onEditClick?:       (id: string) => void;
  onBusinessClick:    (id: string) => void;
  onPublicarClick:    () => void;
  searchQuery?:       string;
}

export function HomePage({
  currentUserId,
  onPublicationClick,
  onEditClick,
  onBusinessClick,
  onPublicarClick,
  searchQuery,
}: HomePageProps) {
  const [activeCategory, setActiveCategory] = useState<PublicationCategory | 'todas'>('todas');

  const { publications, nuevoHoy, businesses, loading, error, refresh } = useFeed(
    activeCategory === 'todas' ? undefined : activeCategory,
    searchQuery,
  );

  const handleRefresh = useCallback(() => { void refresh(); }, [refresh]);

  const isSearching = searchQuery && searchQuery.trim().length > 0;

  return (
    <main className={styles.page}>
      <div className={styles.categoryBar} role="tablist" aria-label="Filtrar por categoria">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={activeCategory === cat.id
              ? styles.categoryBtn + ' ' + styles.categoryActive
              : styles.categoryBtn}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {!isSearching && activeCategory === 'todas' && (
        <NuevoHoyCarousel publications={nuevoHoy} onCardClick={onPublicationClick} />
      )}
      {!isSearching && activeCategory === 'todas' && (
        <NegociosCarousel businesses={businesses} onCardClick={onBusinessClick} />
      )}

      {isSearching && (
        <p className={styles.searchHint}>
          Resultados para: <strong>{searchQuery}</strong>
        </p>
      )}

      <MainFeed
        publications={publications}
        loading={loading}
        error={error}
        currentUserId={currentUserId}
        onCardClick={onPublicationClick}
        onEditClick={onEditClick}
      />

      {!loading && (
        <button className={styles.refreshBtn} onClick={handleRefresh} aria-label="Actualizar feed">
          Actualizar
        </button>
      )}

      <FAB onClick={onPublicarClick} />
    </main>
  );
}