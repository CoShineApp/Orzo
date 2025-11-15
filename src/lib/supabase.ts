import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

// Use placeholder values if env vars are not set to prevent SSR errors
// The actual error will be caught and handled in the component when trying to use the client
const supabaseUrl = env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

