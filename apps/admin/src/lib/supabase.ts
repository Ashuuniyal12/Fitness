import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ypanqzdvcgdnkghphpzr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwYW5xemR2Y2dkbmtnaHBocHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTU2NzksImV4cCI6MjA5ODE5MTY3OX0.VH0rLzEs-uPmgBrucZ2p2KwyIi5BpYNPqHLMgb9F0FE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
