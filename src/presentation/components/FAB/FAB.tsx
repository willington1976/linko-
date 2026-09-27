// src/presentation/components/FAB/FAB.tsx

import styles from './FAB.module.css';

interface FABProps {
  onClick: () => void;
  label?: string;
}

export function FAB({ onClick, label = 'Publicar' }: FABProps) {
  return (
    <button
      className={styles.fab}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className={styles.icon} aria-hidden="true">+</span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}