/**
 * imageUploadService.ts
 * Handles profile picture uploads with:
 *  - Client-side image compression (max 300×300, JPEG 85%)
 *  - Firebase Storage when Firebase is configured
 *  - Base64 localStorage fallback for offline / local mode
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase.js';

// ── Compression ──────────────────────────────────────────────────────────────

/**
 * Compresses an image File to a JPEG data-URL (max 300×300, quality 0.85).
 * Works entirely in the browser — no server needed.
 */
export function compressImage(file: File, maxSide = 300, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Compute scaled dimensions preserving aspect ratio
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          if (width > height) {
            height = Math.round((height / width) * maxSide);
            width = maxSide;
          } else {
            width = Math.round((width / height) * maxSide);
            height = maxSide;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context unavailable'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ── Upload ───────────────────────────────────────────────────────────────────

/**
 * Uploads a profile picture for `uid`.
 *
 * - If Firebase Storage is available  → uploads to `profile-pictures/{uid}.jpg`
 *   and returns the public download URL.
 * - Otherwise (offline mode)          → stores compressed Base64 in localStorage
 *   under key `studymind_avatar_{uid}` and returns the data-URL directly.
 *
 * @param uid    - Firebase user UID (or local mock UID)
 * @param file   - Raw File object from <input type="file">
 * @returns      - A URL string usable as <img src="...">
 */
export async function uploadProfilePicture(uid: string, file: File): Promise<string> {
  // 1. Compress the image first (always, regardless of storage mode)
  const dataUrl = await compressImage(file);

  // 2a. Firebase Storage path
  if (storage) {
    try {
      // Convert data-URL → Blob for Firebase upload
      const blob = dataUrlToBlob(dataUrl);
      const storageRef = ref(storage, `profile-pictures/${uid}.jpg`);
      await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (err) {
      console.warn('Firebase Storage upload failed, falling back to localStorage:', err);
    }
  }

  // 2b. localStorage fallback
  try {
    localStorage.setItem(`studymind_avatar_${uid}`, dataUrl);
  } catch {
    // localStorage might be full — silently swallow; still return in-memory URL
  }
  return dataUrl;
}

/**
 * Returns the locally stored avatar for `uid`, if any.
 * Useful to hydrate the UI in offline mode without re-uploading.
 */
export function getLocalAvatar(uid: string): string | null {
  try {
    return localStorage.getItem(`studymind_avatar_${uid}`);
  } catch {
    return null;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(data);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return new Blob([buffer], { type: mime });
}
