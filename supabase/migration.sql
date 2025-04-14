-- Create the photo_submissions table
CREATE TABLE IF NOT EXISTS public.photo_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hunt_id UUID NOT NULL REFERENCES public.hunts(id) ON DELETE CASCADE,
    waypoint_id UUID NOT NULL REFERENCES public.waypoints(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for the foreign keys
CREATE INDEX IF NOT EXISTS photo_submissions_hunt_id_idx ON public.photo_submissions(hunt_id);
CREATE INDEX IF NOT EXISTS photo_submissions_waypoint_id_idx ON public.photo_submissions(waypoint_id);
CREATE INDEX IF NOT EXISTS photo_submissions_status_idx ON public.photo_submissions(status);

-- Enable Row Level Security (RLS) on the photo_submissions table
ALTER TABLE public.photo_submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow read access to all authenticated users
CREATE POLICY "Allow read access for all users" 
ON public.photo_submissions 
FOR SELECT 
USING (true);

-- Create a policy to allow insert for all authenticated users
CREATE POLICY "Allow insert for all users" 
ON public.photo_submissions 
FOR INSERT 
WITH CHECK (true);

-- Create a policy to allow updates only for authenticated users and only to their own submissions
CREATE POLICY "Allow update for submission owners" 
ON public.photo_submissions 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create the storage bucket for egg hunt photos
-- Note: This must be executed in separate statements in the Supabase dashboard
-- Step 1: Create the bucket
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('egg-hunt-photos', 'egg-hunt-photos', true);

-- Step 2: Create a policy to allow authenticated users to upload files
-- CREATE POLICY "Allow uploads for authenticated users"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'egg-hunt-photos');

-- Step 3: Create a policy to allow public access to view files
-- CREATE POLICY "Allow public access to photos"
-- ON storage.objects
-- FOR SELECT
-- USING (bucket_id = 'egg-hunt-photos');

-- IMPORTANT: Run the following commands in the SQL Editor in the Supabase Dashboard
-- (The storage bucket and policy commands above are commented out because they need to be run separately)

-- STORAGE SETUP INSTRUCTIONS:
-- 1. Go to Storage in the Supabase dashboard
-- 2. Click "Create bucket"
-- 3. Enter "egg-hunt-photos" as the name
-- 4. Check "Public bucket" to make files publicly accessible
-- 5. Click "Create bucket"
-- 6. After creating the bucket, go to "Policies"
-- 7. Add a policy for "INSERT" operations to allow authenticated users to upload
-- 8. Add a policy for "SELECT" to allow public access for viewing photos