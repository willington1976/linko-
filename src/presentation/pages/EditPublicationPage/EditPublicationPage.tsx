// src/presentation/pages/EditPublicationPage/EditPublicationPage.tsx

import { useState, useRef, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../infrastructure/firebase/firebaseConfig';
import { useBusiness } from '../../../application/hooks/useBusiness';
import { CASANARE_MUNICIPALITIES } from '../../../domain/entities/Publication';
import type { PublicationCategory, PublicationIntent, CasanareMunicipality } from '../../../domain/entities/Publication';
import styles from './EditPublicationPage.module.css';

interface EditPublicationPageProps {
  publicationId: string;
  authorId: string;
  onSuccess: (id: string) => void;
  onBack: () => void;
}

const MAX_PHOTOS_PERSONAL = 1;
const MAX_PHOTOS_BUSINESS = 5;

export function EditPublicationPage({ publicationId, authorId, onSuccess, onBack }: EditPublicationPageProps) {
  const { hasMembership } = useBusiness(authorId);
  const maxPhotos = hasMembership ? MAX_PHOTOS_BUSINESS : MAX_PHOTOS_PERSONAL;

  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [category, setCategory]         = useState<PublicationCategory>('articulos');
  const [intent, setIntent]             = useState<PublicationIntent>('ofrezco');
  const [municipality, setMunicipality] = useState<CasanareMunicipality>('Yopal');
  const [price, setPrice]               = useState('');
  const [contactPhone, setPhone]        = useState('');
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotoFiles, setNewPhotoFiles]   = useState<File[]>([]);
  const [loadingData, setLoadingData]   = useState(true);
  const [saving, setSaving]             = useState(false);
  const [progress, setProgress]         = useState(0);
  const [error, setError]               = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      try {
        const snap = await getDoc(doc(db, 'publications', publicationId));
        if (!snap.exists()) { setError('Publicación no encontrada.'); return; }
        const d = snap.data();
        setTitle(d.title ?? '');
        setDescription(d.description ?? '');
        setCategory(d.category ?? 'articulos');
        setIntent(d.intent ?? 'ofrezco');
        setMunicipality(d.municipality ?? 'Yopal');
        setPrice(d.price ? String(d.price) : '');
        setPhone(d.contactPhone ?? '');
        setExistingPhotos(d.photos ?? []);
      } catch {
        setError('Error cargando publicación.');
      } finally {
        setLoadingData(false);
      }
    })();
  }, [publicationId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, maxPhotos);
    setNewPhotoFiles(files);
  };

  const removeExistingPhoto = (url: string) => {
    setExistingPhotos((prev) => prev.filter((p) => p !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      let uploadedUrls: string[] = [];

      if (newPhotoFiles.length > 0) {
        for (const file of newPhotoFiles) {
          const storageRef = ref(storage, `publications/${publicationId}/${Date.now()}_${file.name}`);
          await new Promise<void>((resolve, reject) => {
            const task = uploadBytesResumable(storageRef, file);
            task.on('state_changed',
              (snap) => setProgress((snap.bytesTransferred / snap.totalBytes) * 100),
              reject,
              () => { void getDownloadURL(task.snapshot.ref).then((url) => { uploadedUrls.push(url); resolve(); }); }
            );
          });
        }
      }

      const finalPhotos = [...existingPhotos, ...uploadedUrls].slice(0, maxPhotos);

      await updateDoc(doc(db, 'publications', publicationId), {
        title,
        description,
        category,
        intent,
        municipality,
        contactPhone,
        price: price ? Number(price) : null,
        photos: finalPhotos,
        updatedAt: new Date().toISOString(),
      });

      onSuccess(publicationId);
    } catch {
      setError('Error al guardar cambios. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return <div className={styles.loading}>Cargando publicación...</div>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} type="button">←</button>
        <h1 className={styles.pageTitle}>Editar publicación</h1>
      </div>

      <form className={styles.form} onSubmit={(e) => { void handleSubmit(e); }} noValidate>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="category">Categoría</label>
          <select id="category" className={styles.select} value={category}
            onChange={(e) => setCategory(e.target.value as PublicationCategory)}>
            <option value="articulos">Artículos</option>
            <option value="empleo">Empleo</option>
            <option value="inmuebles">Inmuebles</option>
            <option value="servicios">Servicios</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>¿Qué haces?</label>
          <div className={styles.intentGroup}>
            {(['ofrezco', 'busco'] as PublicationIntent[]).map((i) => (
              <button key={i} type="button"
                className={`${styles.intentBtn} ${intent === i ? styles.intentActive : ''}`}
                onClick={() => setIntent(i)}>
                {i === 'ofrezco' ? 'Ofrezco' : 'Busco'}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">Título *</label>
          <input id="title" className={styles.input} type="text"
            value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">Descripción *</label>
          <textarea id="description" className={styles.textarea} rows={4}
            value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
          <span className={styles.charCount}>{description.length}/2000</span>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="price">Precio (COP) - opcional</label>
          <input id="price" className={styles.input} type="number" min="0"
            value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="municipality">Municipio *</label>
          <div className={styles.locationRow}>
            <input className={styles.inputDisabled} value="Casanare" disabled readOnly />
            <select id="municipality" className={styles.select} value={municipality}
              onChange={(e) => setMunicipality(e.target.value as CasanareMunicipality)}>
              {CASANARE_MUNICIPALITIES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="phone">Teléfono *</label>
          <input id="phone" className={styles.input} type="tel"
            value={contactPhone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        {/* Fotos existentes */}
        {existingPhotos.length > 0 && (
          <div className={styles.field}>
            <label className={styles.label}>Fotos actuales</label>
            <div className={styles.existingPhotos}>
              {existingPhotos.map((url) => (
                <div key={url} className={styles.existingPhotoItem}>
                  <img src={url} alt="foto" className={styles.existingThumb} />
                  <button type="button" className={styles.removePhotoBtn}
                    onClick={() => removeExistingPhoto(url)} title="Eliminar foto">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agregar nuevas fotos */}
        <div className={styles.field}>
          <label className={styles.label}>
            {`Agregar fotos (max. ${String(maxPhotos - existingPhotos.length)} más)`}
          </label>
          <button type="button" className={styles.photoBtn}
            onClick={() => fileRef.current?.click()}>
            📷 {newPhotoFiles.length > 0
              ? `${String(newPhotoFiles.length)} foto${newPhotoFiles.length > 1 ? 's' : ''} seleccionada${newPhotoFiles.length > 1 ? 's' : ''}`
              : 'Seleccionar fotos'}
          </button>
          <input ref={fileRef} type="file" accept="image/*"
            multiple={hasMembership} className={styles.hidden}
            onChange={handlePhotoChange} />
        </div>

        {saving && progress > 0 && progress < 100 && (
          <div className={styles.progressWrapper}>
            <div className={styles.progressBar} style={{ width: `${String(progress)}%` }} />
          </div>
        )}

        {error && <p className={styles.globalError}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>

      </form>
    </main>
  );
}