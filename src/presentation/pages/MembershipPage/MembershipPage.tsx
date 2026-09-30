// src/presentation/pages/MembershipPage/MembershipPage.tsx

import { useState } from 'react';
import { useBusiness } from '../../../application/hooks/useBusiness';
import { updateBusinessMembership } from '../../../infrastructure/firebase/businessService';
import styles from './MembershipPage.module.css';

interface MembershipPageProps {
  userId: string;
  onBack: () => void;
  onSuccess: () => void;
}

const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY as string | undefined;

function buildWompiUrl(params: {
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  redirectUrl: string;
}): string {
  const base = 'https://checkout.wompi.co/p/';
  const query = new URLSearchParams({
    'public-key':        params.publicKey,
    currency:            params.currency,
    'amount-in-cents':   String(params.amountInCents),
    reference:           params.reference,
    'redirect-url':      params.redirectUrl,
  });
  return `${base}?${query.toString()}`;
}

export function MembershipPage({ userId, onBack, onSuccess }: MembershipPageProps) {
  const { business, loading, refresh } = useBusiness(userId);
  const [activating, setActivating]   = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Simulación de activación en desarrollo (cuando no hay Wompi configurado)
  const handleSimulateActivation = async () => {
    setError(null);
    setActivating(true);
    try {
      const now       = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      await updateBusinessMembership(userId, {
        status:         'active',
        plan:           'monthly',
        price:          10000,
        startDate:      now,
        expiresAt,
        wompiPaymentId: 'sim_' + Date.now(),
      });

      refresh();
      onSuccess();
    } catch (err) {
      setError('No se pudo activar la membresía. Intenta de nuevo.');
      console.error(err);
    } finally {
      setActivating(false);
    }
  };

  const handleWompiPay = () => {
    if (!WOMPI_PUBLIC_KEY) return;
    const reference  = `linko_mem_${userId}_${Date.now()}`;
    const redirectUrl = `${window.location.origin}/business/dashboard`;
    const url = buildWompiUrl({
      publicKey:      WOMPI_PUBLIC_KEY,
      currency:       'COP',
      amountInCents:  1000000, // $10.000 COP
      reference,
      redirectUrl,
    });
    window.location.href = url;
  };

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.center}>
          <div className={styles.spinner} />
        </div>
      </main>
    );
  }

  const isActive  = business?.membership.status === 'active';
  const isExpired = business?.membership.status === 'expired';

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} type="button" aria-label="Volver">←</button>
        <h1 className={styles.title}>Membresía</h1>
      </div>

      {isActive && (
        <div className={styles.activeNotice}>
          <span className={styles.activeIcon}>✓</span>
          <div>
            <p className={styles.activeTitle}>Tu membresía está activa</p>
            {business?.membership.expiresAt && (
              <p className={styles.activeSub}>
                Vence el {business.membership.expiresAt.toLocaleDateString('es-CO', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </p>
            )}
          </div>
        </div>
      )}

      <div className={styles.planCard}>
        <div className={styles.planHeader}>
          <span className={styles.planBadge}>Plan mensual</span>
          <div className={styles.planPrice}>
            <span className={styles.priceAmount}>$10.000</span>
            <span className={styles.pricePeriod}> COP / mes</span>
          </div>
        </div>

        <ul className={styles.benefitList}>
          <li className={styles.benefit}>
            <span className={styles.benefitIcon}>📋</span>
            <span>Publicaciones de negocio ilimitadas</span>
          </li>
          <li className={styles.benefit}>
            <span className={styles.benefitIcon}>📷</span>
            <span>Hasta 5 fotos por publicación</span>
          </li>
          <li className={styles.benefit}>
            <span className={styles.benefitIcon}>⭐</span>
            <span>Aparece en el slider principal de Linko</span>
          </li>
          <li className={styles.benefit}>
            <span className={styles.benefitIcon}>✅</span>
            <span>Badge "Negocio Verificado" en tus publicaciones</span>
          </li>
          <li className={styles.benefit}>
            <span className={styles.benefitIcon}>🔄</span>
            <span>Se renueva automáticamente cada mes</span>
          </li>
        </ul>
      </div>

      {error && (
        <div className={styles.errorBox} role="alert">{error}</div>
      )}

      {!isActive && (
        <div className={styles.paySection}>
          {WOMPI_PUBLIC_KEY ? (
            <button
              className={styles.payBtn}
              onClick={handleWompiPay}
              type="button"
              disabled={activating}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect width="24" height="24" rx="4" fill="#6C2BD9"/>
                <path d="M6 12h12M12 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isExpired ? 'Renovar con Wompi — $10.000' : 'Pagar con Wompi — $10.000'}
            </button>
          ) : (
            <div className={styles.devMode}>
              <p className={styles.devNotice}>
                ⚠️ Modo desarrollo — Wompi no configurado
              </p>
              <button
                className={styles.simulateBtn}
                onClick={() => { void handleSimulateActivation(); }}
                type="button"
                disabled={activating}
              >
                {activating ? 'Activando...' : 'Simular activación (dev)'}
              </button>
            </div>
          )}

          <p className={styles.payNote}>
            Pago seguro procesado por Wompi · Cancela cuando quieras
          </p>
        </div>
      )}

      {isActive && (
        <div className={styles.paySection}>
          <p className={styles.renewNote}>
            Tu membresía se renueva automáticamente. Si deseas cancelarla, contáctanos.
          </p>
        </div>
      )}
    </main>
  );
}