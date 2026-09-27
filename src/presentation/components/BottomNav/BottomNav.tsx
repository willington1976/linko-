// src/presentation/components/BottomNav/BottomNav.tsx

import styles from './BottomNav.module.css';

export type BottomNavTab = 'feed' | 'buscar' | 'mis-publicaciones' | 'perfil';

interface BottomNavProps {
  active: BottomNavTab;
  onChange: (tab: BottomNavTab) => void;
}

const TABS: { id: BottomNavTab; label: string; icon: string }[] = [
  { id: 'feed',              label: 'Inicio',    icon: '🏠' },
  { id: 'buscar',            label: 'Buscar',    icon: '🔍' },
  { id: 'mis-publicaciones', label: 'Mis anuncios', icon: '📋' },
  { id: 'perfil',            label: 'Perfil',    icon: '👤' },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className={styles.nav} aria-label="Navegación principal">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${active === tab.id ? styles.active : ''}`}
          onClick={() => onChange(tab.id)}
          aria-label={tab.label}
          aria-current={active === tab.id ? 'page' : undefined}
        >
          <span className={styles.icon} aria-hidden="true">{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}