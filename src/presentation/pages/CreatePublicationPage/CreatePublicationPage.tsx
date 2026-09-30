// src/presentation/pages/CreatePublicationPage/CreatePublicationPage.tsx

import { useState, useRef } from 'react';
import { useCreatePublication } from '../../../application/hooks/useCreatePublication';
import { useBusiness } from '../../../application/hooks/useBusiness';
import { getFieldError } from '../../../domain/validation/publicationValidation';
import { CASANARE_MUNICIPALITIES } from '../../../domain/entities/Publication';
import type { PublicationCategory, PublicationIntent, CasanareMunicipality } from '../../../domain/entities/Publication';
import styles from './CreatePublicationPage.module.css';

interface CreatePublicationPageProps {
  authorId: string;
  onSuccess: (publicationId: string) => void;
  onBack: () => void;
}

const MAX_PHOTOS_PERSONAL  = 1;
const MAX_PHOTOS_BUSINESS  = 5;

export function CreatePublicationPage({ authorId, onSuccess, onBack }: CreatePublicationPageProps) {
  const { loading, uploadProgress, error, submit, reset } = useCreatePublication(authorId);
  const { hasMembership } = useBusiness(authorId);

  const maxPhotos      = hasMembership ? MAX_PHOTOS_BUSINESS : MAX_PHOTOS_PERSONAL;
  const publicationType = hasMembership ? 'business' : 'personal';

  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [category, setCategory]         = useState<PublicationCategory>('articulos');
  const [intent, setIntent]             = useState<PublicationIntent>('ofrezco');
  const [municipality, setMunicipality] = useState<CasanareMunicipality>('Yopal');
  const [price, setPrice]               = useState('');
  const [contactPhone, setPhone]        = useState('');
  const [photoFiles, setPhotoFiles]     = useState<File[]>([]);
  const [fieldErrors, setFieldErrors]   = useState<{ field: string; message: string }[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, maxPhotos);
    setPhotoFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors([]);
    reset();

    const result = await submit({
      title,
      description,
      category,
      intent,
      department: 'casanare',
      municipality,
      contactPhone,
      price: price ? Number(price) : undefined,
      publicationType,
      photoFiles,
    });

    if (result) onSuccess(result.publicationId);
  };

  const fe = (field: string) => getFieldError(fieldErrors, field);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Volver" type="button">
          &larr;
        </button>
        <h1 className={styles.pageTitle}>Nueva publicacion</h1>
      </div>

      {hasMembership && (
        <div className={styles.businessBanner}>
          <span>⭐ Publicacion de negocio · hasta {String(MAX_PHOTOS_BUSINESS)} fotos</span>
        </div>
      )}

      <form className={styles.form} onSubmit={(e) => { void handleSubmit(e); }} noValidate>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="category">Categoria</label>
          <select
            id="category"
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as PublicationCategory)}
          >
            <option value="articulos">Articulos</option>
            <option value="empleo">Empleo</option>
            <option value="inmuebles">Inmuebles</option>
            <option value="servicios">Servicios</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Que haces?</label>
          <div className={styles.intentGroup}>
            {(['ofrezco', 'busco'] as PublicationIntent[]).map((i) => (
              <button
                key={i}
                type="button"
                className={`${styles.intentBtn} ${intent === i ? styles.intentActive : ''}`}
                onClick={() => setIntent(i)}
              >
                {i === 'ofrezco' ? 'Ofrezco' : 'Busco'}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">Titulo *</label>
          <input
            id="title"
            className={`${styles.input} ${fe('title') ? styles.inputError : ''}`}
            type="text"
            placeholder="Ej: Vendo moto Honda 150cc"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          {fe('title') && <span className={styles.errorMsg}>{fe('title')}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">Descripcion *</label>
          <textarea
            id="description"
            className={`${styles.textarea} ${fe('description') ? styles.inputError : ''}`}
            placeholder="Describe lo que ofreces o buscas con detalle..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={4}
          />
          <span className={styles.charCount}>{description.length}/2000</span>
          {fe('description') && <span className={styles.errorMsg}>{fe('description')}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="price">Precio (COP) - opcional</label>
          <input
            id="price"
            className={styles.input}
            type="number"
            placeholder="0"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="municipality">Municipio *</label>
          <div className={styles.locationRow}>
            <input
              className={styles.inputDisabled}
              value="Casanare"
              disabled
              readOnly
            />
            <select
              id="municipality"
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

        <div className={styles.field}>
          <label className={styles.label} htmlFor="phone">Telefono de contacto *</label>
          <input
            id="phone"
            className={`${styles.input} ${fe('contactPhone') ? styles.inputError : ''}`}
            type="tel"
            placeholder="3101234567"
            value={contactPhone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {fe('contactPhone') && <span className={styles.errorMsg}>{fe('contactPhone')}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            {hasMembership
              ? `Fotos (max. ${String(MAX_PHOTOS_BUSINESS)})`
              : `Foto (max. ${String(MAX_PHOTOS_PERSONAL)})`}
          </label>
          <button
            type="button"
            className={styles.photoBtn}
            onClick={() => fileRef.current?.click()}
          >
            {photoFiles.length > 0
              ? `${String(photoFiles.length)} foto${photoFiles.length > 1 ? 's' : ''} seleccionada${photoFiles.length > 1 ? 's' : ''}`
              : 'Agregar foto'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple={hasMembership}
            className={styles.hidden}
            onChange={handlePhotoChange}
          />
          {photoFiles.length > 0 && (
            <div className={styles.photoPreviewRow}>
              {photoFiles.map((f, i) => (
                <span key={i} className={styles.photoName}>{f.name}</span>
              ))}
            </div>
          )}
        </div>

        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className={styles.progressWrapper}>
            <div className={styles.progressBar} style={{ width: `${String(uploadProgress)}%` }} />
            <span className={styles.progressLabel}>{Math.round(uploadProgress)}%</span>
          </div>
        )}

        {error && <p className={styles.globalError}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Publicando...' : 'Publicar'}
        </button>

      </form>
    </main>
  );
}