import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  throw new Error(
    'Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set. ' +
    'Check your .env file locally or your Vercel environment variable settings in production.'
  );
}

export const AUTH_STORAGE_KEY = 'starpass-auth';
export const REMEMBER_ME_KEY = 'starpass_remember_me';

export const getRememberMePreference = () => {
  try {
    const stored = localStorage.getItem(REMEMBER_ME_KEY);
    if (stored === null) return true;
    return stored === 'true';
  } catch {
    return true;
  }
};

export const setRememberMePreference = (remember: boolean) => {
  try {
    localStorage.setItem(REMEMBER_ME_KEY, remember ? 'true' : 'false');
    if (remember) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
};

const selectAuthStorage = () => {
  try {
    return getRememberMePreference() ? localStorage : sessionStorage;
  } catch {
    return localStorage;
  }
};

const authStorage = {
  getItem: (key: string) => selectAuthStorage().getItem(key),
  setItem: (key: string, value: string) => selectAuthStorage().setItem(key, value),
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // ignore storage errors
    }
  },
};

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      storageKey: AUTH_STORAGE_KEY,
      storage: authStorage,
      detectSessionInUrl: true,
    },
  },
);
