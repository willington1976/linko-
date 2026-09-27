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
  { id: 'articulos', label: 'Artículos' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'urgente',   label: '🔴 Urgente' },
];

interface HomePageProps {
  onPublicationClick: (id: string) => void;
  onBusinessClick:    (id: string) => void;
  onPublicarClick:    () => void;
}

export function HomePage({
  onPublicationClick,
  onBusinessClick,
  onPublicarClick,
}: HomePageProps) {
  const [activeCategory, setActiveCategory] = useState<PublicationCategory | 'todas'>('todas');

  const { publications, nuevoHoy, businesses, loading, error, refresh } = useFeed(
    activeCategory === 'todas' ? undefined : activeCategory,
  );

  const handleRefresh = useCallback(() => { void refresh(); }, [refresh]);

  return (
    <main className={styles.page}>
      {/* Filtro por categoría */}
      <div className={styles.categoryBar} role="tablist" aria-label="Filtrar por categoría">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.categoryActive : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Carrusel "Nuevo hoy" — solo en vista "todas" */}
      {activeCategory === 'todas' && (
        <NuevoHoyCarousel
          publications={nuevoHoy}
          onCardClick={onPublicationClick}
        />
      )}

      {/* Carrusel "Negocios cerca" — solo en vista "todas" */}
      {activeCategory === 'todas' && (
        <NegociosCarousel
          businesses={businesses}
          onCardClick={onBusinessClick}
        />
      )}

      {/* Feed principal */}
      <MainFeed
        publications={publications}
        loading={loading}
        error={error}
        onCardClick={onPublicationClick}
      />

      {/* Pull-to-refresh manual (botón) */}
      {!loading && (
        <button className={styles.refreshBtn} onClick={handleRefresh} aria-label="Actualizar feed">
          🔄 Actualizar
        </button>
      )}

      {/* FAB Publicar */}
      <FAB onClick={onPublicarClick} />
    </main>
  );
}