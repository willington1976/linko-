// src/presentation/pages/ProfilePage/ProfilePage.tsx

import type { User } from 'firebase/auth';
import { useBusiness } from '../../../application/hooks/useBusiness';
import styles from './ProfilePage.module.css';

interface ProfilePageProps {
  user: User;
  onSignOut?: () => void;
  onRegistrarNegocio?: () => void;
  onGoToBusinessDashboard?: () => void;
}

export function ProfilePage({
  user,
  onSignOut,
  onRegistrarNegocio,
  onGoToBusinessDashboard,
}: ProfilePageProps) {
  const initial = (user.displayName ?? user.email ?? 'U').charAt(0).toUpperCase();
  const { business, loading: loadingBusiness } = useBusiness(user.uid);

  const handleBusinessBtn = () => {
    if (business) {
      onGoToBusinessDashboard?.();
    } else {
      onRegistrarNegocio?.();
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="avatar"
            className={styles.avatar}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={styles.avatar}>{initial}</div>
        )}
        <h2 className={styles.name}>{user.displayName ?? 'Usuario'}</h2>
        <p className={styles.email}>{user.email}</p>
        <span className={styles.role}>Personal</span>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionBtn} type="button">Mis publicaciones</button>
        <button className={styles.actionBtn} type="button">Configuracion</button>

        {!loadingBusiness && (
          <button className={styles.bizBtn} onClick={handleBusinessBtn} type="button">
            {business ? 'Mi negocio' : 'Registrar mi negocio'}
          </button>
        )}

        {onSignOut && (
          <button className={styles.signOut} onClick={onSignOut} type="button">
            Cerrar sesion
          </button>
        )}
      </div>
    </main>
  );
}