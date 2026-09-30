// src/presentation/pages/BusinessDashboardPage/BusinessDashboardPage.tsx

import { useBusiness } from '../../../application/hooks/useBusiness';
import styles from './BusinessDashboardPage.module.css';

interface BusinessDashboardPageProps {
  userId: string;
  onGoToMembership: () => void;
  onGoToPublications: () => void;
  onGoToRegister: () => void;
  onBack: () => void;
}

export function BusinessDashboardPage({
  userId,
  onGoToMembership,
  onGoToPublications,
  onGoToRegister,
  onBack,
}: BusinessDashboardPageProps) {
  const { business, loading, hasMembership } = useBusiness(userId);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.center}>
          <div className={styles.spinner} />
          <p>Cargando panel...</p>
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className={styles.page}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack} type="button" aria-label="Volver">←</button>
          <h1 className={styles.title}>Mi negocio</h1>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏪</div>
          <h2 className={styles.emptyTitle}>Aún no tienes un negocio registrado</h2>
          <p className={styles.emptyText}>
            Registra tu negocio para publicar con visibilidad preferencial y llegar a más clientes en Casanare.
          </p>
          <button className={styles.primaryBtn} onClick={onGoToRegister} type="button">
            Registrar mi negocio
          </button>
        </div>
      </main>
    );
  }

  const membershipStatus = business.membership.status;

  const membershipLabel: Record<string, string> = {
    active:   'Activa',
    inactive: 'Inactiva',
    expired:  'Vencida',
  };

  const expiresText = business.membership.expiresAt
    ? `Vence el ${business.membership.expiresAt.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}`
    : null;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} type="button" aria-label="Volver">←</button>
        <h1 className={styles.title}>Mi negocio</h1>
      </div>

      {/* Perfil del negocio */}
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>
          {business.logoURL
            ? <img src={business.logoURL} alt={business.businessName} className={styles.logoImg} />
            : <span className={styles.avatarLetter}>{business.businessName.charAt(0).toUpperCase()}</span>
          }
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.businessName}>{business.businessName}</h2>
          <p className={styles.businessMeta}>{business.municipality}, Casanare</p>
          <p className={styles.businessMeta}>{business.contactPhone}</p>
        </div>
      </div>

      {/* Estado membresía */}
      <div className={`${styles.membershipCard} ${styles[`membership_${membershipStatus}`]}`}>
        <div className={styles.membershipTop}>
          <div>
            <p className={styles.membershipLabel}>Membresía</p>
            <p className={styles.membershipStatus}>{membershipLabel[membershipStatus] ?? 'Inactiva'}</p>
          </div>
          <div className={`${styles.membershipBadge} ${styles[`badge_${membershipStatus}`]}`}>
            {membershipStatus === 'active' ? '✓ Activa' : membershipStatus === 'expired' ? '✗ Vencida' : '— Inactiva'}
          </div>
        </div>

        {membershipStatus === 'active' && expiresText && (
          <p className={styles.membershipExpiry}>{expiresText}</p>
        )}

        {membershipStatus === 'active' && (
          <div className={styles.benefitsList}>
            <p className={styles.benefitsTitle}>Beneficios activos:</p>
            <ul className={styles.benefits}>
              <li>✓ Publicaciones ilimitadas</li>
              <li>✓ Hasta 5 fotos por publicación</li>
              <li>✓ Apareces en el slider principal</li>
              <li>✓ Badge "Negocio Verificado"</li>
            </ul>
          </div>
        )}

        {membershipStatus !== 'active' && (
          <button className={styles.activateBtn} onClick={onGoToMembership} type="button">
            {membershipStatus === 'expired' ? 'Renovar membresía — $10.000/mes' : 'Activar membresía — $10.000/mes'}
          </button>
        )}
      </div>

      {/* Acciones */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionCard} ${!hasMembership ? styles.actionDisabled : ''}`}
          onClick={hasMembership ? onGoToPublications : onGoToMembership}
          type="button"
        >
          <span className={styles.actionIcon}>📋</span>
          <div className={styles.actionText}>
            <span className={styles.actionTitle}>Mis publicaciones</span>
            <span className={styles.actionSub}>
              {hasMembership ? 'Ver y gestionar publicaciones' : 'Requiere membresía activa'}
            </span>
          </div>
          <span className={styles.actionArrow}>›</span>
        </button>

        <button
          className={styles.actionCard}
          onClick={onGoToMembership}
          type="button"
        >
          <span className={styles.actionIcon}>💳</span>
          <div className={styles.actionText}>
            <span className={styles.actionTitle}>Membresía</span>
            <span className={styles.actionSub}>Gestionar plan de pago</span>
          </div>
          <span className={styles.actionArrow}>›</span>
        </button>
      </div>

      {/* Info plan */}
      <div className={styles.planInfo}>
        <p className={styles.planInfoText}>
          Plan mensual · <strong>$10.000 COP</strong> · Se renueva automáticamente
        </p>
      </div>
    </main>
  );
}