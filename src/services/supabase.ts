import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// TODO: Configure after creating a project in Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
