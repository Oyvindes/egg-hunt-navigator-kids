import { supabase } from './client';
import { v4 as uuidv4 } from 'uuid';
import { Database } from './types';

// Define submission status types
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface PhotoSubmission {
  id: string;
  huntId: string;
  waypointId: string;
  photoUrl: string;
  timestamp: string;
  status: SubmissionStatus;
}

/**
 * Upload a photo to Supabase Storage
 * @param photoData - Base64 encoded photo data
 * @param huntId - ID of the hunt
 * @param waypointId - ID of the waypoint
 * @returns URL of the uploaded photo
 */
export const uploadPhoto = async (photoData: string, huntId: string, waypointId: string): Promise<string> => {
  try {
    // Convert base64 to file
    const base64Data = photoData.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, { type: 'image/jpeg' });
    const file = new File([blob], `${waypointId}_${Date.now()}.jpg`, { type: 'image/jpeg' });

    // Generate a unique file path
    const filePath = `submissions/${huntId}/${waypointId}/${uuidv4()}.jpg`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('egg-hunt-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('egg-hunt-photos')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

/**
 * Create a photo submission in the database
 * @param huntId - ID of the hunt
 * @param waypointId - ID of the waypoint
 * @param photoUrl - URL of the uploaded photo
 * @returns The created submission
 */
export const createPhotoSubmission = async (
  huntId: string,
  waypointId: string,
  photoUrl: string
): Promise<PhotoSubmission> => {
  try {
    const submission = {
      hunt_id: huntId,
      waypoint_id: waypointId,
      photo_url: photoUrl,
      timestamp: new Date().toISOString(),
      status: 'pending' as SubmissionStatus
    };

    const { data, error } = await supabase
      .from('photo_submissions')
      .insert(submission)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      huntId: data.hunt_id,
      waypointId: data.waypoint_id,
      photoUrl: data.photo_url,
      timestamp: data.timestamp,
      status: data.status as SubmissionStatus
    };
  } catch (error) {
    console.error('Error creating photo submission:', error);
    throw error;
  }
};

/**
 * Get all pending photo submissions
 * @returns Array of pending photo submissions
 */
export const getPendingPhotoSubmissions = async (): Promise<PhotoSubmission[]> => {
  try {
    const { data, error } = await supabase
      .from('photo_submissions')
      .select('*')
      .eq('status', 'pending')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return data.map((item: any) => ({
      id: item.id,
      huntId: item.hunt_id,
      waypointId: item.waypoint_id,
      photoUrl: item.photo_url,
      timestamp: item.timestamp,
      status: item.status as SubmissionStatus
    }));
  } catch (error) {
    console.error('Error fetching pending submissions:', error);
    throw error;
  }
};

/**
 * Update the status of a photo submission
 * @param submissionId - ID of the submission
 * @param status - New status ('approved' or 'rejected')
 */
export const updateSubmissionStatus = async (
  submissionId: string,
  status: 'approved' | 'rejected'
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('photo_submissions')
      .update({ status })
      .eq('id', submissionId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating submission status:', error);
    throw error;
  }
};

/**
 * Check if there's a pending submission for a specific waypoint
 * @param huntId - ID of the hunt
 * @param waypointId - ID of the waypoint
 * @returns Whether there's a pending submission
 */
export const hasPendingSubmission = async (
  huntId: string,
  waypointId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('photo_submissions')
      .select('*')
      .eq('hunt_id', huntId)
      .eq('waypoint_id', waypointId)
      .eq('status', 'pending')
      .limit(1);

    if (error) throw error;

    return data.length > 0;
  } catch (error) {
    console.error('Error checking pending submissions:', error);
    return false;
  }
};

/**
 * Check submission status for a specific waypoint
 * @param huntId - ID of the hunt
 * @param waypointId - ID of the waypoint
 * @returns Object with wasApproved and wasRejected flags
 */
export const checkSubmissionStatus = async (
  huntId: string,
  waypointId: string
): Promise<{isPending: boolean; wasRejected: boolean}> => {
  try {
    // First check for pending submissions
    const { data: pendingData, error: pendingError } = await supabase
      .from('photo_submissions')
      .select('*')
      .eq('hunt_id', huntId)
      .eq('waypoint_id', waypointId)
      .eq('status', 'pending')
      .limit(1);

    if (pendingError) throw pendingError;
    
    // If there's a pending submission, return early
    if (pendingData.length > 0) {
      return { isPending: true, wasRejected: false };
    }

    // Check for recently rejected submissions
    const { data: rejectedData, error: rejectedError } = await supabase
      .from('photo_submissions')
      .select('*')
      .eq('hunt_id', huntId)
      .eq('waypoint_id', waypointId)
      .eq('status', 'rejected')
      .order('timestamp', { ascending: false })
      .limit(1);

    if (rejectedError) throw rejectedError;

    return {
      isPending: false,
      wasRejected: rejectedData.length > 0
    };
  } catch (error) {
    console.error('Error checking submission status:', error);
    return { isPending: false, wasRejected: false };
  }
};

/**
 * Get all photo submissions for a waypoint
 * @param huntId - ID of the hunt
 * @param waypointId - ID of the waypoint
 * @returns Array of photo submissions
 */
export const getWaypointSubmissions = async (
  huntId: string,
  waypointId: string
): Promise<PhotoSubmission[]> => {
  try {
    const { data, error } = await supabase
      .from('photo_submissions')
      .select('*')
      .eq('hunt_id', huntId)
      .eq('waypoint_id', waypointId)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return data.map((item: any) => ({
      id: item.id,
      huntId: item.hunt_id,
      waypointId: item.waypoint_id,
      photoUrl: item.photo_url,
      timestamp: item.timestamp,
      status: item.status as SubmissionStatus
    }));
  } catch (error) {
    console.error('Error fetching waypoint submissions:', error);
    throw error;
  }
};