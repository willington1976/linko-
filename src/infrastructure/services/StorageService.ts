// src/infrastructure/services/StorageService.ts

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from 'firebase/storage';
import { storage } from '../firebase/firebaseConfig';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percent: number;
}

// ─── Sube una foto y devuelve la URL pública ──────────────────────────────────

export function uploadPublicationPhoto(
  file: File,
  authorId: string,
  onProgress?: (p: UploadProgress) => void,
): { task: UploadTask; urlPromise: Promise<string> } {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `publications/${authorId}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  const urlPromise = new Promise<string>((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        if (onProgress) {
          onProgress({
            bytesTransferred: snap.bytesTransferred,
            totalBytes:       snap.totalBytes,
            percent:          (snap.bytesTransferred / snap.totalBytes) * 100,
          });
        }
      },
      reject,
      () => {
        getDownloadURL(task.snapshot.ref).then(resolve).catch(reject);
      },
    );
  });

  return { task, urlPromise };
}

// ─── Sube el logo de un negocio ───────────────────────────────────────────────

export function uploadBusinessLogo(
  file: File,
  businessId: string,
  onProgress?: (p: UploadProgress) => void,
): { task: UploadTask; urlPromise: Promise<string> } {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `businesses/${businessId}/logo.${ext}`;
  const storageRef = ref(storage, path);
  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
  });

  const urlPromise = new Promise<string>((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        if (onProgress) {
          onProgress({
            bytesTransferred: snap.bytesTransferred,
            totalBytes:       snap.totalBytes,
            percent:          (snap.bytesTransferred / snap.totalBytes) * 100,
          });
        }
      },
      reject,
      () => {
        getDownloadURL(task.snapshot.ref).then(resolve).catch(reject);
      },
    );
  });

  return { task, urlPromise };
}

// ─── Elimina un archivo por su URL pública ────────────────────────────────────

export async function deleteFileByUrl(url: string): Promise<void> {
  const fileRef = ref(storage, url);
  await deleteObject(fileRef);
}