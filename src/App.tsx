// src/App.tsx

import { useState } from 'react';
import { Navbar }    from './presentation/components/Navbar/Navbar';
import { BottomNav } from './presentation/components/BottomNav/BottomNav';
import { HomePage }  from './presentation/pages/HomePage/HomePage';
import { PublicationDetailPage } from './presentation/pages/PublicationDetailPage/PublicationDetailPage';
import { CreatePublicationPage } from './presentation/pages/CreatePublicationPage/CreatePublicationPage';
import { ProfilePage } from './presentation/pages/ProfilePage/ProfilePage';
import type { BottomNavTab } from './presentation/components/BottomNav/BottomNav';
import './presentation/styles/tokens.css';
import './App.css';

// ── Rutas simples sin react-router (SPA manual) ──────────────────────────────
type Route =
  | { screen: 'home' }
  | { screen: 'detail'; publicationId: string }
  | { screen: 'create' }
  | { screen: 'profile' }
  | { screen: 'search' };

// TEMP: reemplazar con Firebase Auth real en siguiente fase
const TEMP_AUTH = {
  uid:         'temp-user-001',
  displayName: 'Usuario Linko',
};

export function App() {
  const [route, setRoute]     = useState<Route>({ screen: 'home' });
  const [activeTab, setActiveTab] = useState<BottomNavTab>('feed');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Navegación ──────────────────────────────────────────────────────────────
  const goHome   = () => { setRoute({ screen: 'home' });    setActiveTab('feed'); };
  const goCreate = () => { setRoute({ screen: 'create' });  };
  

  const goDetail = (publicationId: string) => {
    setRoute({ screen: 'detail', publicationId });
  };

  const handleTabChange = (tab: BottomNavTab) => {
    setActiveTab(tab);
    if (tab === 'feed')    setRoute({ screen: 'home' });
    if (tab === 'perfil')  setRoute({ screen: 'profile' });
    if (tab === 'buscar')  setRoute({ screen: 'search' });
    if (tab === 'mis-publicaciones') setRoute({ screen: 'home' }); // placeholder
  };

  // ── Decidir si mostrar Navbar/BottomNav ────────────────────────────────────
  const hideChrome = route.screen === 'create';

  return (
    <div className="app">
      {!hideChrome && (
        <Navbar onSearch={setSearchQuery} />
      )}

      {/* ── Contenido principal ── */}
      <div className="app-content">
        {route.screen === 'home' && (
          <HomePage
            onPublicationClick={goDetail}
            onBusinessClick={(id) => console.log('business:', id)} // TODO: BusinessDetailPage
            onPublicarClick={goCreate}
          />
        )}

        {route.screen === 'detail' && (
          <PublicationDetailPage
            publicationId={route.publicationId}
            onBack={goHome}
          />
        )}

        {route.screen === 'create' && (
          <CreatePublicationPage
            authorId={TEMP_AUTH.uid}
            onSuccess={(id) => { goDetail(id); }}
            onBack={goHome}
          />
        )}

        {route.screen === 'profile' && (
          <ProfilePage onSignOut={goHome} />
        )}

        {route.screen === 'search' && (
          <div className="search-placeholder">
            <p>🔍 Búsqueda: <strong>{searchQuery || '...'}</strong></p>
          </div>
        )}
      </div>

      {!hideChrome && (
        <BottomNav active={activeTab} onChange={handleTabChange} />
      )}
    </div>
  );
}