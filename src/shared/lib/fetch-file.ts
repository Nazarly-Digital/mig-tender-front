// Helpers for fetching protected files (documents, images) with the user's
// access token. Works for both pre-signed public URLs and authenticated
// API endpoints — falls back gracefully when CORS/auth blocks one path.

import { apiInstance } from '@/shared/api';
import { useSessionStore } from '@/entities/auth/model/store';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

/**
 * Returns true if the URL points at our backend API (relative or absolute).
 * For those URLs we want to attach the Bearer token; for everything else
 * (S3 presigned, public CDN) we leave them untouched so we don't break sigs.
 */
function isApiUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  if (API_URL && url.startsWith(API_URL)) return true;
  // Same origin without API path counts as backend too (Django serves /media/).
  try {
    const u = new URL(url);
    const apiHost = API_URL ? new URL(API_URL).host : '';
    return apiHost ? u.host === apiHost : false;
  } catch {
    return false;
  }
}

/**
 * Fetches the URL as a Blob using the most likely-to-work auth strategy.
 * Throws on network/auth failure so callers can fall back to opening the
 * URL directly in a new tab.
 */
export async function fetchFileBlob(url: string): Promise<Blob> {
  if (isApiUrl(url)) {
    const res = await apiInstance.get<Blob>(url, { responseType: 'blob' });
    return res.data;
  }
  // Presigned URL — attach token only if same origin lets us; otherwise raw fetch.
  const token = useSessionStore.getState().accessToken;
  const res = await fetch(url, {
    credentials: 'omit',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.blob();
}

/**
 * Triggers a browser download for an authenticated file URL. Falls back to
 * opening the URL in a new tab if the blob fetch fails.
 */
export async function downloadAuthedFile(url: string, filename: string): Promise<void> {
  try {
    const blob = await fetchFileBlob(url);
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Opens the file in a new browser tab. For authenticated endpoints this
 * fetches the blob first and opens an Object URL so the browser doesn't
 * lose the Bearer token across the tab boundary.
 */
export async function openAuthedFile(url: string): Promise<void> {
  if (!isApiUrl(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  try {
    const blob = await fetchFileBlob(url);
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    // Revoke after a delay so the new tab has time to load it.
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
