// src/presentation/pages/CreatePublicationPage/CreatePublicationPage.tsx

import { useState, useRef } from 'react';
import { useCreatePublication } from '../../../application/hooks/useCreatePublication';
import { getFieldError } from '../../../domain/validation/publicationValidation';
import type { PublicationCategory, PublicationIntent } from '../../../domain/entities/Publication';
import styles from './CreatePublicationPage.module.css';

interface CreatePublicationPageProps {
  authorId: string;
  onSuccess: (publicationId: string) => void;
  onBack: () => void;
}

export function CreatePublicationPage({ authorId, onSuccess, onBack }: CreatePublicationPageProps) {
  const { loading, uploadProgress, error, submit, reset } = useCreatePublication(authorId);

  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]       = useState<PublicationCategory>('articulos');
  const [intent, setIntent]           = useState<PublicationIntent>('ofrezco');
  const [location, setLocation]       = useState('');
  const [price, setPrice]             = useState('');
  const [contactPhone, setPhone]      = useState('');
  const [photoFiles, setPhotoFiles]   = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ field: string; message: string }[]>([]);

  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 1); // personal = max 1
    setPhotoFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors([]);
    reset();

    const result = await submit({
      title, description, category, intent,
      location, contactPhone,
      price: price ? Number(price) : undefined,
      publicationType: 'personal',
      photoFiles,
    });

    if (result) onSuccess(result.publicationId);
  };

  const fe = (field: string) => getFieldError(fieldErrors, field);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="Volver">←</button>
        <h1 className={styles.pageTitle}>Nueva publicación</h1>
      </div>

      <form className={styles.form} onSubmit={(e) => { void handleSubmit(e); }} noValidate>

        {/* Categoría */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="category">Categoría</label>
          <select
            id="category"
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value as PublicationCategory)}
          >
            <option value="articulos">Artículos</option>
            <option value="empleo">Empleo</option>
            <option value="inmuebles">Inmuebles</option>
            <option value="servicios">Servicios</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        {/* Intent */}
        <div className={styles.field}>
          <label className={styles.label}>¿Qué haces?</label>
          <div className={styles.intentGroup}>
            {(['ofrezco', 'busco'] as PublicationIntent[]).map((i) => (
              <button
                key={i}
                type="button"
                className={`${styles.intentBtn} ${intent === i ? styles.intentActive : ''}`}
                onClick={() => setIntent(i)}
              >
                {i === 'ofrezco' ? '✋ Ofrezco' : '🔍 Busco'}
              </button>
            ))}
          </div>
        </div>

        {/* Título */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">Título *</label>
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

        {/* Descripción */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">Descripción *</label>
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

        {/* Precio */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="price">Precio (COP) — opcional</label>
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

        {/* Ubicación */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="location">Ubicación *</label>
          <input
            id="location"
            className={`${styles.input} ${fe('location') ? styles.inputError : ''}`}
            type="text"
            placeholder="Ej: Yopal, Casanare"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          {fe('location') && <span className={styles.errorMsg}>{fe('location')}</span>}
        </div>

        {/* Teléfono */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="phone">Teléfono de contacto *</label>
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

        {/* Foto */}
        <div className={styles.field}>
          <label className={styles.label}>Foto (máx. 1)</label>
          <button
            type="button"
            className={styles.photoBtn}
            onClick={() => fileRef.current?.click()}
          >
            📷 {photoFiles.length > 0 ? photoFiles[0]!.name : 'Agregar foto'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className={styles.hidden}
            onChange={handlePhotoChange}
          />
        </div>

        {/* Progreso de subida */}
        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className={styles.progressWrapper}>
            <div className={styles.progressBar} style={{ width: `${String(uploadProgress)}%` }} />
            <span className={styles.progressLabel}>{Math.round(uploadProgress)}%</span>
          </div>
        )}

        {/* Error global */}
        {error && <p className={styles.globalError}>⚠️ {error}</p>}

        {/* Submit */}
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? 'Publicando...' : '✅ Publicar'}
        </button>
      </form>
    </main>
  );
}