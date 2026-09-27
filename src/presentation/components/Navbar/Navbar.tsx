// src/presentation/components/Navbar/Navbar.tsx

import styles from './Navbar.module.css';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export function Navbar({ onSearch }: NavbarProps) {
  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <span className={styles.logo}>Linko</span>

        {/* Buscador */}
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon} aria-hidden="true">🔍</span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Buscar en Linko..."
            aria-label="Buscar publicaciones"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      </div>
    </header>
  );
}