// src/presentation/pages/ProfilePage/ProfilePage.tsx

import styles from './ProfilePage.module.css';

// Placeholder — auth real se integra en siguiente fase
const TEMP_USER = {
  displayName: 'Usuario Linko',
  email: 'usuario@linko.app',
  role: 'user' as 'user' | 'business',
};

interface ProfilePageProps {
  onSignOut?: () => void;
}

export function ProfilePage({ onSignOut }: ProfilePageProps) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.avatar}>
          {TEMP_USER.displayName.charAt(0).toUpperCase()}
        </div>
        <h2 className={styles.name}>{TEMP_USER.displayName}</h2>
        <p className={styles.email}>{TEMP_USER.email}</p>
        <span className={styles.role}>
          {TEMP_USER.role === 'business' ? '🏪 Negocio' : '👤 Personal'}
        </span>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionBtn}>📋 Mis publicaciones</button>
        <button className={styles.actionBtn}>⚙️ Configuración</button>
        {onSignOut && (
          <button className={`${styles.actionBtn} ${styles.signOut}`} onClick={onSignOut}>
            🚪 Cerrar sesión
          </button>
        )}
      </div>
    </main>
  );
}