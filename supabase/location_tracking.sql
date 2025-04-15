-- Create user_locations table for live location tracking
CREATE TABLE IF NOT EXISTS user_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    hunt_id UUID NOT NULL REFERENCES hunts(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION NOT NULL,
    display_name TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_waypoint TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_locations_hunt_id ON user_locations(hunt_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_timestamp ON user_locations(timestamp);

-- Create RLS policies
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert/update their own locations
CREATE POLICY "Users can insert their own location" 
ON user_locations FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update their own location" 
ON user_locations FOR UPDATE 
TO authenticated 
USING (auth.uid()::text = user_id);

-- Allow authenticated users to read all locations in a hunt they participate in
CREATE POLICY "Users can read all locations in their active hunt" 
ON user_locations FOR SELECT 
TO authenticated 
USING (hunt_id IN (
    SELECT h.id FROM hunts h
    WHERE h.active = true
));

-- Function to automatically clean up old location data (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_locations()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM user_locations
  WHERE timestamp < NOW() - INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run cleanup every 100 inserts
CREATE TRIGGER trigger_cleanup_old_locations
AFTER INSERT ON user_locations
FOR EACH ROW
WHEN (pg_trigger_depth() = 0)
EXECUTE FUNCTION cleanup_old_locations();