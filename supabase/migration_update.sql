-- Create the photo_submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.photo_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hunt_id UUID NOT NULL REFERENCES public.hunts(id) ON DELETE CASCADE,
    waypoint_id UUID NOT NULL REFERENCES public.waypoints(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for the foreign keys (if they don't exist)
CREATE INDEX IF NOT EXISTS photo_submissions_hunt_id_idx ON public.photo_submissions(hunt_id);
CREATE INDEX IF NOT EXISTS photo_submissions_waypoint_id_idx ON public.photo_submissions(waypoint_id);
CREATE INDEX IF NOT EXISTS photo_submissions_status_idx ON public.photo_submissions(status);

-- Enable Row Level Security (RLS) on the photo_submissions table
ALTER TABLE public.photo_submissions ENABLE ROW LEVEL SECURITY;

-- First, drop existing policies if they exist (to avoid errors on recreation)
DO $$
BEGIN
    -- Drop policies if they exist
    BEGIN
        DROP POLICY IF EXISTS "Allow read access for all users" ON public.photo_submissions;
    EXCEPTION WHEN OTHERS THEN
        -- Do nothing if the policy doesn't exist
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Allow insert for all users" ON public.photo_submissions;
    EXCEPTION WHEN OTHERS THEN
        -- Do nothing if the policy doesn't exist
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Allow update for all users" ON public.photo_submissions;
    EXCEPTION WHEN OTHERS THEN
        -- Do nothing if the policy doesn't exist
    END;
END$$;

-- Create updated policies for anonymous access
CREATE POLICY "Allow read access for all users" 
ON public.photo_submissions 
FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Allow insert for all users" 
ON public.photo_submissions 
FOR INSERT 
TO anon
WITH CHECK (true);

CREATE POLICY "Allow update for all users" 
ON public.photo_submissions 
FOR UPDATE 
TO anon
USING (true)
WITH CHECK (true);