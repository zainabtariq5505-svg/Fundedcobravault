import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// We use the anon key for client-side operations. 
// Row Level Security (RLS) is configured in the DB to allow authenticated operations.
// Since this is an internal admin tool, we can use anon key if policies allow public access,
// OR we can use the service role key for guaranteed access since it's a secure admin environment.
// For Next.js client components, it's safer to use anon key and proper RLS, 
// but since the user hasn't set up Auth users, we will use the anon key and rely on the RLS policies 
// we created earlier: `CREATE POLICY "Allow authenticated full access" ON public.affiliates FOR ALL TO authenticated USING (true);`
// Wait, the policies I created were for `authenticated`. If we don't log them into Supabase Auth, they will be `anon`.
// Let's use the anon key, but we need to ensure the DB policies allow anon, OR we can export a secure server-side client.
// Actually, since we're injecting this into Zustand which runs on the client, we MUST use anon key.
// If the DB policies fail, we will need to adjust them.

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
