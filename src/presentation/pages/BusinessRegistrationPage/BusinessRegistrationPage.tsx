// src/presentation/pages/BusinessRegistrationPage/BusinessRegistrationPage.tsx

import { useState, useRef } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../infrastructure/firebase/firebaseConfig';
import { VALID_BUSINESS_CATEGORIES } from '../../../domain/entities/Business';
import type { BusinessCategory } from '../../../domain/entities/Business';
import { CASANARE_MUNICIPALITIES } from '../../../domain/entities/Publication';
import type { CasanareMunicipality } from '../../../domain/entities/Publication';
import styles from './BusinessRegistrationPage.module.css';

interface BusinessRegistrationPageProps {
  ownerId: string;
  onSuccess: (businessId: string) => void;
  onBack: () => void;
}

const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  restaurante:   'Restaurante / Cafetería',
  tienda:        'Tienda / Comercio',
  taller:        'Taller / Mecánica',
  salud:         'Salud / Estética',
  educacion:     'Educación / Academia',
  servicios:     'Servicios Profesionales',
  construccion:  'Construcción / Materiales',
  otro:          'Otro',
};

export function BusinessRegistrationPage({
  ownerId,
  onSuccess,
  onBack,
}: BusinessRegistrationPageProps) {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]       = useState<BusinessCategory>('tienda');
  const [phone, setPhone]             = useState('');
  const [address, setAddress]         = useState('');
  const [municipality, setMunicipality] = useState<CasanareMunicipality>('Yopal');
  const [logoFile, setLogoFile]       = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError('El nombre del negocio es requerido.'); return; }
    if (!description.trim()) { setError('La descripción es requerida.'); return; }
    if (!phone.trim()) { setError('El teléfono es requerido.'); return; }
    if (!address.trim()) { setError('La dirección es requerida.'); return; }

    setLoading(true);

    try {
      // Subir logo si existe
      let logoUrl: string | undefined;
      if (logoFile) {
        const { uploadBusinessLogo } = await import('../../../infrastructure/services/StorageService');
        const { urlPromise } = uploadBusinessLogo(logoFile, ownerId);
        logoUrl = await urlPromise;
      }

      const fn = httpsCallable<unknown, { businessId: string }>(functions, 'createBusiness');
      const res = await fn({
        name:        name.trim(),
        description: description.trim(),
        category,
        phone:       phone.trim(),
        address:     address.trim(),
        location:    municipality,   // el validador espera 'location' como string
        logo:        logoUrl,
      });

      onSuccess(res.data.businessId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el negocio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Volver">{'<'}</button>
        <h1 className={styles.pageTitle}>Registrar negocio</h1>
      </div>

      <div className={styles.heroBanner}>
        <span className={styles.heroIcon}>🏪</span>
        <p className={styles.heroText}>Crea tu perfil de negocio y llega a miles de clientes en Casanare</p>
      </div>

      <form className={styles.form} onSubmit={(e) => { void handleSubmit(e); }} noValidate>

        {/* Logo */}
        <div className={styles.logoSection}>
          <button
            type="button"
            className={styles.logoBtn}
            onClick={() => fileRef.current?.click()}
          >
            {logoPreview
              ? <img src={logoPreview} alt="Logo" className={styles.logoPreview} />
              : <span className={styles.logoPlaceholder}>📷<br />Agregar logo</span>
            }
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className={styles.hidden}
            onChange={handleLogoChange}
          />
          <p className={styles.logoHint}>Opcional — foto de tu local o logo</p>
        </div>

        {/* Nombre */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="biz-name">Nombre del negocio *</label>
          <input
            id="biz-name"
            className={styles.input}
            type="text"
            placeholder="Ej: Ferretería El Constructor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Categoría */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="biz-category">Categoría *</label>
          <select
            id="biz-category"
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as BusinessCategory)}
          >
            {VALID_BUSINESS_CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="biz-desc">Descripción *</label>
          <textarea
            id="biz-desc"
            className={styles.textarea}
            placeholder="Describe qué ofreces, tus productos o servicios principales..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <span className={styles.charCount}>{description.length}/500</span>
        </div>

        {/* Municipio */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="biz-mun">Municipio *</label>
          <div className={styles.locationRow}>
            <input className={styles.inputDisabled} value="Casanare" disabled readOnly />
            <select
              id="biz-mun"
              className={styles.select}
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value as CasanareMunicipality)}
            >
              {CASANARE_MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dirección */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="biz-address">Dirección *</label>
          <input
            id="biz-address"
            className={styles.input}
            type="text"
            placeholder="Ej: Calle 12 # 8-45, Barrio Centro"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            maxLength={200}
          />
        </div>

        {/* Teléfono */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="biz-phone">Teléfono de contacto *</label>
          <input
            id="biz-phone"
            className={styles.input}
            type="tel"
            placeholder="3101234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {error && <p className={styles.globalError}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar negocio'}
        </button>

        <p className={styles.membershipNote}>
          Después del registro podrás activar tu membresía para aparecer destacado en el feed.
        </p>
      </form>
    </main>
  );
}
