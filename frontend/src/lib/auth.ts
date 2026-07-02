export const TOKEN_KEYS = ["accessToken", "token", "authToken"] as const;
export const AUTH_EVENT = "auth:changed";



export function apiBase(): string {
  const raw =
    import.meta.env.VITE_API_BASE ??
    "http://127.0.0.1:8787/api";

  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}


