declare global {
  interface Window {
    __ENV__?: {
      VITE_API_BASE_URL?: string;
      VITE_CURRENCY_RATE?: string;
    };
  }
}

export function getEnv(key: keyof NonNullable<Window['__ENV__']>, fallback: string): string {
  return window.__ENV__?.[key] || import.meta.env[key] || fallback;
}
