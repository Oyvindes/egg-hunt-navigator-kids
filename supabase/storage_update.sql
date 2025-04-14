-- SUPABASE STORAGE SETUP SQL COMMANDS FOR ANONYMOUS ACCESS

-- Step 1: Create the 'egg-hunt-photos' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('egg-hunt-photos', 'egg-hunt-photos', true)
ON CONFLICT (id) DO NOTHING;

-- First, drop existing policies if they exist (to avoid errors on recreation)
DO $$
BEGIN
    -- Drop policies if they exist
    BEGIN
        DROP POLICY IF EXISTS "Public View Access" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        -- Do nothing if the policy doesn't exist
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Anyone Can Upload" ON storage.objects;
        DROP POLICY IF EXISTS "Auth Users Can Upload" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        -- Do nothing if the policy doesn't exist
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Anyone Can Update" ON storage.objects;
        DROP POLICY IF EXISTS "File Owners Can Update" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        -- Do nothing if the policy doesn't exist
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Anyone Can Delete" ON storage.objects;
        DROP POLICY IF EXISTS "File Owners Can Delete" ON storage.objects;
    EXCEPTION WHEN OTHERS THEN
        -- Do nothing if the policy doesn't exist
    END;
END$$;

-- Step 2: Create updated policies to allow anonymous access
-- Allow anyone to view files in the bucket (public read access)
CREATE POLICY "Public View Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'egg-hunt-photos');

-- Allow anonymous users to upload files to the bucket
CREATE POLICY "Anyone Can Upload"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'egg-hunt-photos');

-- Allow anonymous users to update files
CREATE POLICY "Anyone Can Update"
ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'egg-hunt-photos')
WITH CHECK (bucket_id = 'egg-hunt-photos');

-- Allow anonymous users to delete files
CREATE POLICY "Anyone Can Delete"
ON storage.objects
FOR DELETE
TO anon
USING (bucket_id = 'egg-hunt-photos');

-- IMPORTANT NOTE:
-- If you encounter errors about conflicting policy names, you may need to
-- manually remove existing policies in the Supabase dashboard before running this script.
-- To do this:
-- 1. Go to Storage in the Supabase dashboard
-- 2. Click on the "egg-hunt-photos" bucket
-- 3. Go to "Policies" tab
-- 4. Delete any existing policies
-- 5. Then run this script again