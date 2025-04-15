import { supabase } from './client';
import { UserLocation } from './types';

/**
 * Update the user's current location in the database
 * 
 * @param userId - Unique identifier for the user
 * @param huntId - ID of the hunt they're participating in
 * @param latitude - Current latitude
 * @param longitude - Current longitude
 * @param accuracy - GPS accuracy in meters
 * @param displayName - Optional display name for the user
 * @param lastWaypoint - Optional name of the last waypoint the user was near
 */
export const updateUserLocation = async (
  userId: string,
  huntId: string,
  latitude: number,
  longitude: number,
  accuracy: number,
  displayName?: string,
  lastWaypoint?: string
): Promise<void> => {
  try {
    // Create location data object matching our database schema
    const locationData = {
      user_id: userId,
      hunt_id: huntId,
      latitude,
      longitude,
      accuracy,
      display_name: displayName,
      timestamp: new Date().toISOString(),
      last_waypoint: lastWaypoint
    };

    // First check if record exists (using upsert pattern)
    const { data, error: fetchError } = await supabase
      .from('user_locations')
      .select('id')
      .eq('user_id', userId)
      .eq('hunt_id', huntId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking for existing location:', fetchError);
      throw fetchError;
    }
    
    if (data?.id) {
      // Update existing record
      const { error } = await supabase
        .from('user_locations')
        .update(locationData)
        .eq('id', data.id);
      
      if (error) {
        console.error('Error updating location record:', error);
        throw error;
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('user_locations')
        .insert(locationData);
      
      if (error) {
        console.error('Error inserting location record:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('Error updating user location:', error);
    throw error;
  }
};

/**
 * Get all active user locations for a specific hunt
 * 
 * @param huntId - ID of the hunt
 * @param maxAgeMinutes - Maximum age in minutes for locations to be considered active (default: 5)
 */
export const getActiveUserLocations = async (
  huntId: string,
  maxAgeMinutes: number = 5
): Promise<UserLocation[]> => {
  try {
    // Calculate cutoff time based on maxAgeMinutes
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - maxAgeMinutes);
    
    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('hunt_id', huntId)
      .gte('timestamp', cutoffTime.toISOString());
    
    if (error) {
      console.error('Error fetching active user locations:', error);
      throw error;
    }
    
    // Transform database response to our interface format
    return (data || []).map(record => ({
      id: record.id,
      user_id: record.user_id,
      hunt_id: record.hunt_id,
      latitude: record.latitude,
      longitude: record.longitude,
      accuracy: record.accuracy,
      timestamp: new Date(record.timestamp),
      display_name: record.display_name || 'Unknown User',
      last_waypoint: record.last_waypoint
    }));
  } catch (error) {
    console.error('Error fetching active user locations:', error);
    return [];
  }
};