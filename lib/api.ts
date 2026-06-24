import "server-only";

import { buildBackendUrl, getBackendApiKey } from "@/lib/backend";
import { normalizeUserRole } from "@/lib/roles";

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-API-Key", getBackendApiKey());
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(buildBackendUrl(path), {
    ...init,
    headers,
    cache: "no-store",
  });
  return res;
}

export async function apiFetchJson<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiFetchForRole(
  path: string,
  role: unknown,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-User-Role", normalizeUserRole(role));

  return apiFetch(path, {
    ...init,
    headers,
  });
}
