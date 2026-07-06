declare global {
  interface Window {
    __ENV__?: {
      VITE_API_BASE_URL?: string;
      VITE_CURRENCY_RATE?: string;
    };
  }
}

export function getEnv(key: keyof NonNullable<Window['__ENV__']>, fallback: string): string {
  const runtime = window.__ENV__?.[key];
  // Skip unsubstituted envsubst placeholders served on non-Docker hosts (e.g. Vercel)
  if (runtime && !runtime.startsWith('${')) {
    return runtime;
  }
  return import.meta.env[key] || fallback;
}
