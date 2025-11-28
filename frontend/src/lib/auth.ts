export const TOKEN_KEYS = ["accessToken", "token", "authToken"] as const;
export const AUTH_EVENT = "auth:changed";

export function getToken(): string | null {
  for (const key of TOKEN_KEYS) {
    const v = localStorage.getItem(key);
    if (v) return v;
  }
  return null;
}

export function setToken(token: string) {
  localStorage.setItem("accessToken", token);
  window.dispatchEvent(new CustomEvent(AUTH_EVENT));
}

export function clearToken() {
  for (const key of TOKEN_KEYS) localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent(AUTH_EVENT));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function apiBase(): string {
  // Vite-style env
  // @ts-ignore
  const raw = (import.meta as any).env?.VITE_API_BASE || "http://127.0.0.1:8787/api";
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

export function onAuthChange(listener: () => void) {
  const handler = () => listener();
  window.addEventListener(AUTH_EVENT, handler as EventListener);
  window.addEventListener("storage", handler as EventListener);
  return () => {
    window.removeEventListener(AUTH_EVENT, handler as EventListener);
    window.removeEventListener("storage", handler as EventListener);
  };
}

