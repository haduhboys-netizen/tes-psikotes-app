import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kbffilsptmhwvivevoid.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_B9CiF4QPhdjSwvnx85RZfw_fF1EzQiw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);