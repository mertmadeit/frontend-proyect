import "server-only";

import { buildBackendUrl, getBackendApiKey } from "@/lib/backend";

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(buildBackendUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": getBackendApiKey(),
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
  return res;
}

export async function apiFetchJson<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
