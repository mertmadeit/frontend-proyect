import "server-only";

const DEFAULT_BACKEND_API_BASE_URL = "http://localhost:8080/api";
const DEFAULT_BACKEND_API_KEY = "change-me-local";

function normalizeBaseUrl(value: string | undefined) {
  const normalized = value?.trim();
  if (!normalized) {
    return DEFAULT_BACKEND_API_BASE_URL;
  }

  return normalized.replace(/\/+$/, "");
}

export function getBackendApiBaseUrl() {
  return normalizeBaseUrl(process.env.BACKEND_API_BASE_URL);
}

export function getBackendApiKey() {
  const apiKey = process.env.BACKEND_API_KEY?.trim() || DEFAULT_BACKEND_API_KEY;

  return apiKey;
}

export function buildBackendUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendApiBaseUrl()}${cleanPath}`;
}
