
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://grzbwpruafzjlgwuhqug.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyemJ3cHJ1YWZ6amxnd3VocXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMDg5OTYsImV4cCI6MjA1Nzc4NDk5Nn0.xaWbyW3FHgchc4RzayWhknmF4MplHPfo-rKM1RA7b3o";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
