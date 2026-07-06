declare global {
  interface Window {
    __ENV__?: {
      VITE_API_BASE_URL?: string;
      VITE_CURRENCY_RATE?: string;
      VITE_STRIPE_PUBLISHABLE_KEY?: string;
    };
  }
}

const clean = (v: string) => v.replace(/^﻿/, '').trim();

export function getEnv(key: keyof NonNullable<Window['__ENV__']>, fallback: string): string {
  const runtime = window.__ENV__?.[key];
  // Skip unsubstituted envsubst placeholders served on non-Docker hosts (e.g. Vercel)
  if (runtime && !runtime.startsWith('${')) {
    return clean(runtime);
  }
  const buildTime = import.meta.env[key] as string | undefined;
  return buildTime ? clean(buildTime) : fallback;
}
