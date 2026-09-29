// src/App.tsx

import { useState } from 'react';
import { Navbar }    from './presentation/components/Navbar/Navbar';
import { BottomNav } from './presentation/components/BottomNav/BottomNav';
import { HomePage }  from './presentation/pages/HomePage/HomePage';
import { PublicationDetailPage }    from './presentation/pages/PublicationDetailPage/PublicationDetailPage';
import { CreatePublicationPage }    from './presentation/pages/CreatePublicationPage/CreatePublicationPage';
import { MyPublicationsPage }       from './presentation/pages/MyPublicationsPage/MyPublicationsPage';
import { BusinessRegistrationPage } from './presentation/pages/BusinessRegistrationPage/BusinessRegistrationPage';
import { ProfilePage } from './presentation/pages/ProfilePage/ProfilePage';
import { LoginPage }   from './presentation/pages/LoginPage/LoginPage';
import { useAuth }     from './application/hooks/useAuth';
import type { BottomNavTab } from './presentation/components/BottomNav/BottomNav';
import './presentation/styles/tokens.css';
import './App.css';

type Route =
  | { screen: 'home' }
  | { screen: 'detail'; publicationId: string }
  | { screen: 'create' }
  | { screen: 'profile' }
  | { screen: 'mis-publicaciones' }
  | { screen: 'search' }
  | { screen: 'registro-negocio' };

export function App() {
  const { user, loading, logout } = useAuth();
  const [route, setRoute]         = useState<Route>({ screen: 'home' });
  const [activeTab, setActiveTab] = useState<BottomNavTab>('feed');
  const [searchQuery, setSearchQuery] = useState('');

  const goHome            = () => { setRoute({ screen: 'home' }); setActiveTab('feed'); };
  const goCreate          = () => { setRoute({ screen: 'create' }); };
  const goDetail          = (publicationId: string) => setRoute({ screen: 'detail', publicationId });
  const goRegistroNegocio = () => setRoute({ screen: 'registro-negocio' });

  const handleTabChange = (tab: BottomNavTab) => {
    setActiveTab(tab);
    if (tab === 'feed')               setRoute({ screen: 'home' });
    if (tab === 'perfil')             setRoute({ screen: 'profile' });
    if (tab === 'buscar')             setRoute({ screen: 'search' });
    if (tab === 'mis-publicaciones')  setRoute({ screen: 'mis-publicaciones' });
  };

  const hideChrome =
    route.screen === 'create' ||
    route.screen === 'registro-negocio';

  if (loading) {
    return <div className="app-loading">Cargando...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="app">
      {!hideChrome && <Navbar onSearch={setSearchQuery} />}

      <div className="app-content">
        {route.screen === 'home' && (
          <HomePage
            onPublicationClick={goDetail}
            onBusinessClick={(id) => console.log('business:', id)}
            onPublicarClick={goCreate}
            searchQuery={searchQuery}
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
            authorId={user.uid}
            onSuccess={(id) => { goDetail(id); }}
            onBack={goHome}
          />
        )}

        {route.screen === 'mis-publicaciones' && (
          <MyPublicationsPage
            authorId={user.uid}
            onPublicationClick={goDetail}
            onPublicarClick={goCreate}
          />
        )}

        {route.screen === 'registro-negocio' && (
          <BusinessRegistrationPage
            ownerId={user.uid}
            onSuccess={(businessId) => {
              console.log('Negocio creado:', businessId);
              goHome();
            }}
            onBack={goHome}
          />
        )}

        {route.screen === 'profile' && (
          <ProfilePage
            user={user}
            onSignOut={logout}
            onRegistrarNegocio={goRegistroNegocio}
          />
        )}

        {route.screen === 'search' && (
          <div className="search-placeholder">
            <p>Busqueda: <strong>{searchQuery || '...'}</strong></p>
          </div>
        )}
      </div>

      {!hideChrome && <BottomNav active={activeTab} onChange={handleTabChange} />}
    </div>
  );
}
