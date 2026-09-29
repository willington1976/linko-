// src/presentation/pages/LoginPage/LoginPage.tsx

import { useState, type FormEvent } from 'react';
import { useAuth } from '../../../application/hooks/useAuth';
import styles from './LoginPage.module.css';

function getAuthErrorMessage(err: any): string {
  if (!err) return 'Ocurrió un error al iniciar sesión.';
  const code = err.code || '';
  const msg = err.message || '';

  switch (code) {
    case 'auth/operation-not-allowed':
      return 'El método de inicio de sesión no está activado en tu consola de Firebase. Por favor ve a Firebase Console > Authentication > Sign-in method y actívalo.';
    case 'auth/unauthorized-domain':
      return 'Dominio no autorizado en Firebase Console. Por favor agrega "localhost" o tu IP en Firebase Console > Authentication > Settings > Authorized Domains.';
    case 'auth/popup-closed-by-user':
      return 'La ventana emergente de inicio de sesión fue cerrada antes de completarse.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente de inicio de sesión. Por favor permite las ventanas emergentes.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos. Por favor verifica tus datos o crea una cuenta.';
    case 'auth/email-already-in-use':
      return 'Este correo electrónico ya está registrado. Por favor inicia sesión.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Debe contener al menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/network-request-failed':
      return 'Error de conexión a la red. Por favor verifica tu internet.';
    case 'auth/invalid-api-key':
      return 'La API key de Firebase configurada en .env.local no es válida.';
    case 'auth/admin-restricted-operation':
      return 'Operación restringida por el administrador en Firebase Console.';
    default:
      if (msg.includes('API key')) {
        return 'Clave API de Firebase no válida. Revisa las variables de entorno (.env.local).';
      }
      return msg || 'Ocurrió un error al intentar iniciar sesión.';
  }
}

export function LoginPage() {
  const {
    signInWithGooglePopup,
    signInWithGoogleRedirect,
    signInEmail,
    signUpEmail,
    signInGuest,
    error: globalError,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'google' | 'email'>('google');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeError = errorMessage || (globalError ? getAuthErrorMessage({ code: globalError, message: globalError }) : null);


  const handleGooglePopup = () => {
    setErrorMessage(null);
    setLoading(true);
    signInWithGooglePopup()
      .catch((err: any) => {
        console.error('Google Popup Error:', err);
        setErrorMessage(getAuthErrorMessage(err));
        setLoading(false);
      });
  };

  const handleGoogleRedirect = () => {
    setErrorMessage(null);
    setLoading(true);
    signInWithGoogleRedirect()
      .catch((err: any) => {
        console.error('Google Redirect Error:', err);
        setErrorMessage(getAuthErrorMessage(err));
        setLoading(false);
      });
  };



  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      if (isRegistering) {
        await signUpEmail(email, password);
      } else {
        await signInEmail(email, password);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await signInGuest();
    } catch (err: any) {
      console.error('Guest Auth Error:', err);
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.logo}>Linko</h1>
        <p className={styles.tagline}>El mercado temporal de Casanare</p>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'google' ? styles.activeTab : ''}`}
            onClick={() => { setActiveTab('google'); setErrorMessage(null); }}
            type="button"
          >
            Google
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'email' ? styles.activeTab : ''}`}
            onClick={() => { setActiveTab('email'); setErrorMessage(null); }}
            type="button"
          >
            Correo
          </button>
        </div>

        {activeTab === 'google' && (
          <div>
            <button
              className={styles.googleBtn}
              onClick={handleGooglePopup}
              disabled={loading}
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
            </button>
            <button
              type="button"
              className={styles.toggleMode}
              onClick={handleGoogleRedirect}
              disabled={loading}
              style={{ marginTop: '0.875rem' }}
            >
              🌐 ¿No abre la ventana? Usar inicio por redirección
            </button>
          </div>
        )}


        {activeTab === 'email' && (
          <form className={styles.form} onSubmit={handleEmailSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email-input">Correo electrónico</label>
              <input
                id="email-input"
                type="email"
                className={styles.input}
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password-input">Contraseña</label>
              <input
                id="password-input"
                type="password"
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button
              className={styles.submitBtn}
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Procesando...'
                : isRegistering
                ? 'Crear Cuenta'
                : 'Iniciar Sesión'}
            </button>
            <button
              type="button"
              className={styles.toggleMode}
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMessage(null);
              }}
            >
              {isRegistering
                ? '¿Ya tienes cuenta? Inicia sesión aquí'
                : '¿No tienes cuenta? Regístrate gratis'}
            </button>
          </form>
        )}

        <div className={styles.divider}>
          <span>o</span>
        </div>

        <button
          className={styles.guestBtn}
          onClick={handleGuest}
          disabled={loading}
          type="button"
        >
          {loading ? 'Ingresando...' : '👤 Continuar como invitado'}
        </button>

        {activeError && (
          <div className={styles.errorBox} role="alert">
            <strong>Causa del problema:</strong>
            {activeError}
          </div>
        )}

      </div>
    </main>
  );
}