import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xakdofkmympbhxkbkxbh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhha2RvZmtteW1wYmh4a2JreGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5NDU4ODUsImV4cCI6MjA3NDUyMTg4NX0.2aAg3xIFKOLRcozCZB9rObKMo1ZycOKedGKrAmuOhO0';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
