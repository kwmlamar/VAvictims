import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzvkazwywzztavkgfzuu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dmthend5d3p6dGF2a2dmenV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTExODcsImV4cCI6MjA2NTU4NzE4N30.T3Wxd2Xlc1x7_WMPoo6VwtJqv-TetQMHCkPtgjXFi80';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);