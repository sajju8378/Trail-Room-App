/**
 * Global API Configuration for Web & Android APK
 * 
 * Supports:
 * - VITE_API_BASE_URL environment variable (e.g. deployed Google Cloud Run URL)
 * - In-app configurable backend URL stored in localStorage for showroom tablet operators
 * - Default relative origin ('') when served together via Express / Cloud Run
 */

const RAW_ENV_URL = (import.meta.env.VITE_API_BASE_URL || '').trim();
export const DEFAULT_API_BASE_URL = RAW_ENV_URL.replace(/\/+$/, '');

export function getApiBaseUrl(): string {
  const customUrl = localStorage.getItem('aura_api_base_url');
  if (customUrl && customUrl.trim()) {
    return customUrl.trim().replace(/\/+$/, '');
  }
  return DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(url: string): void {
  const clean = url.trim().replace(/\/+$/, '');
  if (!clean) {
    localStorage.removeItem('aura_api_base_url');
  } else {
    localStorage.setItem('aura_api_base_url', clean);
  }
}

export function getHealthEndpoint(): string {
  const base = getApiBaseUrl();
  return `${base}/api/health`;
}

export function getTryOnEndpoint(): string {
  const base = getApiBaseUrl();
  return `${base}/api/tryon`;
}
