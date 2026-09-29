// src/presentation/pages/MyPublicationsPage/MyPublicationsPage.tsx

import { useEffect, useState, useCallback } from 'react';
import { fetchPublicationsByAuthor } from '../../../infrastructure/repositories/PublicationRepository';
import { PublicationCard } from '../../components/PublicationCard/PublicationCard';
import type { Publication } from '../../../domain/entities/Publication';
import styles from './MyPublicationsPage.module.css';

interface MyPublicationsPageProps {
  authorId: string;
  onPublicationClick: (id: string) => void;
  onPublicarClick: () => void;
}

export function MyPublicationsPage({
  authorId,
  onPublicationClick,
  onPublicarClick,
}: MyPublicationsPageProps) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublicationsByAuthor(authorId);
      setPublications(data);
    } catch (err) {
      setError('Error al cargar tus publicaciones.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authorId]);

  useEffect(() => { void load(); }, [load]);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mis publicaciones</h1>
        <button className={styles.newBtn} onClick={onPublicarClick}>
          + Nueva
        </button>
      </div>

      {loading && (
        <div className={styles.state}>
          <span className={styles.spinner} />
          <p>Cargando...</p>
        </div>
      )}

      {!loading && error && (
        <div className={styles.state}>
          <p className={styles.errorMsg}>{error}</p>
          <button className={styles.retryBtn} onClick={() => void load()}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && publications.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>📋</p>
          <p className={styles.emptyText}>Todavía no tienes publicaciones.</p>
          <button className={styles.emptyBtn} onClick={onPublicarClick}>
            Crear mi primera publicación
          </button>
        </div>
      )}

      {!loading && !error && publications.length > 0 && (
        <div className={styles.grid}>
          {publications.map((pub) => (
            <PublicationCard
              key={pub.id}
              publication={pub}
              onClick={onPublicationClick}
            />
          ))}
        </div>
      )}
    </main>
  );
}
