-- SUPABASE STORAGE SETUP SQL COMMANDS
-- Run these commands in the SQL Editor in the Supabase Dashboard

-- Step 1: Create the 'egg-hunt-photos' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('egg-hunt-photos', 'egg-hunt-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Allow anyone to view files in the bucket (public read access)
CREATE POLICY "Public View Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'egg-hunt-photos');

-- Step 3: Allow anyone to upload files to the bucket (public upload access)
CREATE POLICY "Anyone Can Upload"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'egg-hunt-photos');

-- Step 4: Allow anyone to update files
CREATE POLICY "Anyone Can Update"
ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'egg-hunt-photos')
WITH CHECK (bucket_id = 'egg-hunt-photos');

-- Step 5: Allow anyone to delete files
CREATE POLICY "Anyone Can Delete"
ON storage.objects
FOR DELETE
TO anon
USING (bucket_id = 'egg-hunt-photos');

-- ALTERNATIVE METHOD:
-- If you prefer using the Supabase Dashboard UI instead:
-- 1. Go to the Storage section in the Supabase Dashboard
-- 2. Click "Create bucket"
-- 3. Enter "egg-hunt-photos" as the bucket name
-- 4. Enable "Public bucket" option
-- 5. Click "Create bucket"
-- 6. After creating, go to the "Policies" tab
-- 7. Add the following policies:
--    - SELECT: Allow public access (everyone can view)
--    - INSERT: Allow authenticated users (signed-in users can upload)
--    - UPDATE: Allow file owners (users can update their files)
--    - DELETE: Allow file owners (users can delete their files)