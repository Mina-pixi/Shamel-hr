import { createClient } from '@supabase/supabase-js';

export const pointsDB = createClient(
  'https://kxofspsvtbkdiddajyfi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4b2ZzcHN2dGJrZGlkZGFqeWZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIwMzA1OCwiZXhwIjoyMDkwNzc5MDU4fQ.6TEqnsnYL2Rbk6pysNdRBVYRX2rcGKWtw1GNZpTdVWY'
);

export const crmDB = createClient(
  'https://foqssrrrcenswrvswqxe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcXNzcnJyY2Vuc3dydnN3cXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIzMjUzNywiZXhwIjoyMDgzODA4NTM3fQ.st0oFZB3DOi0EGXrU1-B4ogH61r-1JcDmNNgACOeHMo'
);

export const crmAnon = createClient(
  'https://foqssrrrcenswrvswqxe.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcXNzcnJyY2Vuc3dydnN3cXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzI1MzcsImV4cCI6MjA4MzgwODUzN30.B8gGMUS2A3CTnTdWZTCJJ83XUbGIwuObchjkxLTQjXk'
);
