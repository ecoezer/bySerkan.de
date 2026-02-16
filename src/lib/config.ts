/**
 * Centralized application configuration.
 * All environment variables are validated at import time — the app
 * fails fast if required values are missing.
 */

// ---------------------------------------------------------------------------
// Environment variable helpers
// ---------------------------------------------------------------------------

function requireEnv(key: string): string {
    const value = import.meta.env[key];
    if (!value || typeof value !== 'string' || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value.trim();
}

function optionalEnv(key: string, fallback: string): string {
    const value = import.meta.env[key];
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;
}

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

export const SUPABASE_URL = requireEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = requireEnv('VITE_SUPABASE_ANON_KEY');

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Comma-separated admin emails parsed once at boot */
const ADMIN_EMAILS: readonly string[] = Object.freeze(
    requireEnv('VITE_ADMIN_EMAILS')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean),
);

/** Monitor account email — used for the monitor-only login flow */
export const MONITOR_EMAIL = optionalEnv('VITE_MONITOR_EMAIL', 'monitor@byserkan.de');

/** Check whether a given email is an authorized admin */
export function isAdminEmail(email: string | undefined | null): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

// ---------------------------------------------------------------------------
// Supabase table names — single source of truth
// ---------------------------------------------------------------------------

export const TABLE = {
    ORDERS: 'orders',
    CATEGORIES: 'categories',
    MENU_ITEMS: 'menu_items',
    SETTINGS: 'settings',
} as const;

// ---------------------------------------------------------------------------
// Environment mode
// ---------------------------------------------------------------------------

/** Whether the app is running in development mode */
export const IS_DEV = import.meta.env.DEV;
