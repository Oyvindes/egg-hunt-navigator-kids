
import { Hunt, Waypoint, Hint } from '@/lib/types';
import { supabase } from "@/integrations/supabase/client";

export async function fetchHunts() {
  const { data: huntsData, error: huntsError } = await supabase
    .from('hunts')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (huntsError) throw huntsError;
  
  const completeHunts: Hunt[] = [];
  
  for (const hunt of huntsData) {
    const { data: waypointsData, error: waypointsError } = await supabase
      .from('waypoints')
      .select('*')
      .eq('hunt_id', hunt.id)
      .order('order_number', { ascending: true });
      
    if (waypointsError) throw waypointsError;
    
    const waypoints: Waypoint[] = [];
    
    for (const waypoint of waypointsData) {
      const { data: hintsData, error: hintsError } = await supabase
        .from('hints')
        .select('*')
        .eq('waypoint_id', waypoint.id)
        .order('distance_threshold', { ascending: false });
        
      if (hintsError) throw hintsError;
      
      waypoints.push({
        id: waypoint.id,
        name: waypoint.name,
        latitude: parseFloat(waypoint.latitude as string),
        longitude: parseFloat(waypoint.longitude as string),
        order: waypoint.order_number,
        hints: hintsData.map((hint: any) => ({
          id: hint.id,
          text: hint.text,
          distanceThreshold: hint.distance_threshold,
          revealed: hint.revealed
        })),
        found: waypoint.found,
        startingHint: waypoint.starting_hint || undefined
      });
    }
    
    completeHunts.push({
      id: hunt.id,
      name: hunt.name,
      date: hunt.date || undefined,
      waypoints,
      active: hunt.active
    });
  }
  
  return completeHunts;
}

export async function updateActiveHunt(huntId: string) {
  await supabase
    .from('hunts')
    .update({ active: false })
    .neq('id', huntId);
    
  await supabase
    .from('hunts')
    .update({ active: true })
    .eq('id', huntId);
}

export async function createHunt(hunt: Omit<Hunt, "id">) {
  const { data, error } = await supabase
    .from('hunts')
    .insert({ 
      name: hunt.name,
      date: hunt.date,
      active: false
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateHuntData(hunt: Hunt) {
  const { error } = await supabase
    .from('hunts')
    .update({
      name: hunt.name,
      date: hunt.date,
      active: hunt.active
    })
    .eq('id', hunt.id);
    
  if (error) throw error;
}

export async function removeHunt(huntId: string) {
  const { error } = await supabase
    .from('hunts')
    .delete()
    .eq('id', huntId);
    
  if (error) throw error;
}

export async function createWaypoint(huntId: string, waypoint: Omit<Waypoint, "id" | "found">) {
  const { data: waypointData, error: waypointError } = await supabase
    .from('waypoints')
    .insert({
      hunt_id: huntId,
      name: waypoint.name,
      latitude: waypoint.latitude.toString(),
      longitude: waypoint.longitude.toString(),
      order_number: waypoint.order,
      starting_hint: waypoint.startingHint || null,
      found: false
    })
    .select()
    .single();
  
  if (waypointError) throw waypointError;
  
  if (waypoint.hints && waypoint.hints.length > 0) {
    const hintsToInsert = waypoint.hints
      .filter(hint => hint.text.trim() !== '')
      .map(hint => ({
        waypoint_id: waypointData.id,
        text: hint.text,
        distance_threshold: hint.distanceThreshold,
        revealed: false
      }));
      
    if (hintsToInsert.length > 0) {
      const { error: hintsError } = await supabase
        .from('hints')
        .insert(hintsToInsert);
        
      if (hintsError) throw hintsError;
    }
  }
  
  // Fetch updated waypoint with hints
  const { data: refetchedWaypointData, error: refetchError } = await supabase
    .from('waypoints')
    .select('*')
    .eq('id', waypointData.id)
    .single();
    
  if (refetchError) throw refetchError;
  
  const { data: hintsData, error: hintsQueryError } = await supabase
    .from('hints')
    .select('*')
    .eq('waypoint_id', waypointData.id);
    
  if (hintsQueryError) throw hintsQueryError;
  
  return {
    waypointData: refetchedWaypointData,
    hintsData
  };
}

export async function modifyWaypoint(waypointId: string, waypointData: Partial<Waypoint>) {
  const { error: waypointError } = await supabase
    .from('waypoints')
    .update({
      name: waypointData.name,
      latitude: waypointData.latitude?.toString(),
      longitude: waypointData.longitude?.toString(),
      order_number: waypointData.order,
      starting_hint: waypointData.startingHint || null,
      found: waypointData.found
    })
    .eq('id', waypointId);
    
  if (waypointError) throw waypointError;
  
  if (waypointData.hints) {
    // Delete existing hints
    const { error: deleteHintsError } = await supabase
      .from('hints')
      .delete()
      .eq('waypoint_id', waypointId);
      
    if (deleteHintsError) throw deleteHintsError;
    
    // Insert new hints
    const hintsToInsert = waypointData.hints
      .filter(hint => hint.text.trim() !== '')
      .map(hint => ({
        waypoint_id: waypointId,
        text: hint.text,
        distance_threshold: hint.distanceThreshold,
        revealed: hint.revealed
      }));
      
    if (hintsToInsert.length > 0) {
      const { error: hintsError } = await supabase
        .from('hints')
        .insert(hintsToInsert);
        
      if (hintsError) throw hintsError;
    }
  }
}

export async function removeWaypoint(waypointId: string) {
  const { error } = await supabase
    .from('waypoints')
    .delete()
    .eq('id', waypointId);
    
  if (error) throw error;
}

export async function updateWaypointFoundStatus(waypointId: string, found: boolean) {
  const { error } = await supabase
    .from('waypoints')
    .update({ found })
    .eq('id', waypointId);
    
  if (error) throw error;
}

export async function updateHintRevealedStatus(hintId: string, revealed: boolean) {
  const { error } = await supabase
    .from('hints')
    .update({ revealed })
    .eq('id', hintId);
    
  if (error) throw error;
}
