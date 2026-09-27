// src/presentation/components/TTLBadge/TTLBadge.tsx

import { useTTL } from '../../../application/hooks/useTTL';
import styles from './TTLBadge.module.css';

interface TTLBadgeProps {
  expiresAt: Date;
}

export function TTLBadge({ expiresAt }: TTLBadgeProps) {
  const ttl = useTTL(expiresAt);

  return (
    <span
      className={`${styles.badge} ${styles[ttl.labelVariant]}`}
      aria-label={`Expira en: ${ttl.label}`}
    >
      ⏱ {ttl.label}
    </span>
  );
}