import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

/** Singleton Supabase client — config.ts validates env vars at boot */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
