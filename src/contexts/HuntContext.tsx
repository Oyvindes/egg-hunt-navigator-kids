import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Hunt, Waypoint, Hint } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HuntContextProps {
  hunts: Hunt[];
  activeHunt: Hunt | null;
  currentWaypoint: Waypoint | null;
  setActiveHunt: (huntId: string) => void;
  addHunt: (hunt: Omit<Hunt, "id">) => void;
  updateHunt: (hunt: Hunt) => void;
  deleteHunt: (huntId: string) => void;
  addWaypoint: (huntId: string, waypoint: Omit<Waypoint, "id" | "found">) => void;
  updateWaypoint: (huntId: string, waypoint: Waypoint) => void;
  deleteWaypoint: (huntId: string, waypointId: string) => void;
  setWaypointFound: (huntId: string, waypointId: string, found: boolean) => void;
  setHintRevealed: (huntId: string, waypointId: string, hintId: string, revealed: boolean) => void;
  moveToNextWaypoint: () => void;
  progressPercentage: number;
  isHuntCompleted: boolean;
  isLoading: boolean;
}

const HuntContext = createContext<HuntContextProps>({
  hunts: [],
  activeHunt: null,
  currentWaypoint: null,
  setActiveHunt: () => {},
  addHunt: () => {},
  updateHunt: () => {},
  deleteHunt: () => {},
  addWaypoint: () => {},
  updateWaypoint: () => {},
  deleteWaypoint: () => {},
  setWaypointFound: () => {},
  setHintRevealed: () => {},
  moveToNextWaypoint: () => {},
  progressPercentage: 0,
  isHuntCompleted: false,
  isLoading: true
});

export const useHunt = () => useContext(HuntContext);

interface HuntProviderProps {
  children: ReactNode;
}

export const HuntProvider = ({ children }: HuntProviderProps) => {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [activeHuntId, setActiveHuntId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchHunts = async () => {
      setIsLoading(true);
      try {
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
              latitude: parseFloat(waypoint.latitude),
              longitude: parseFloat(waypoint.longitude),
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
        
        setHunts(completeHunts);
        
        if (completeHunts.length > 0) {
          const activeHunt = completeHunts.find(h => h.active);
          setActiveHuntId(activeHunt ? activeHunt.id : completeHunts[0].id);
        }
        
      } catch (error) {
        console.error('Error fetching hunts:', error);
        toast({
          title: "Feil ved henting av data",
          description: "Kunne ikke hente påskejakter fra databasen",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHunts();
  }, [toast]);
  
  const activeHunt = hunts.find(hunt => hunt.id === activeHuntId) || null;
  const currentWaypoint = activeHunt?.waypoints.find(wp => !wp.found) || null;
  
  const totalWaypoints = activeHunt?.waypoints.length || 0;
  const foundWaypoints = activeHunt?.waypoints.filter(wp => wp.found).length || 0;
  const progressPercentage = totalWaypoints > 0 ? (foundWaypoints / totalWaypoints) * 100 : 0;
  
  const isHuntCompleted = totalWaypoints > 0 && foundWaypoints === totalWaypoints;
  
  const setActiveHunt = async (huntId: string) => {
    const huntExists = hunts.some(hunt => hunt.id === huntId);
    if (huntExists) {
      setActiveHuntId(huntId);
      
      try {
        await supabase
          .from('hunts')
          .update({ active: false })
          .neq('id', huntId);
          
        await supabase
          .from('hunts')
          .update({ active: true })
          .eq('id', huntId);
          
        setHunts(prevHunts => 
          prevHunts.map(hunt => ({
            ...hunt,
            active: hunt.id === huntId
          }))
        );
      } catch (error) {
        console.error('Error updating active hunt:', error);
        toast({
          title: "Feil ved oppdatering",
          description: "Kunne ikke aktivere påskejakten",
          variant: "destructive"
        });
      }
    }
  };

  const addHunt = async (hunt: Omit<Hunt, "id">) => {
    try {
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
      
      const newHunt: Hunt = {
        ...hunt,
        id: data.id,
      };
      
      setHunts(prevHunts => [...prevHunts, newHunt]);
      
      toast({
        title: "Påskejakt opprettet",
        description: `${newHunt.name} ble opprettet`,
      });
    } catch (error) {
      console.error('Error adding hunt:', error);
      toast({
        title: "Feil ved opprettelse",
        description: "Kunne ikke legge til påskejakten",
        variant: "destructive"
      });
    }
  };

  const updateHunt = async (updatedHunt: Hunt) => {
    try {
      const { error } = await supabase
        .from('hunts')
        .update({
          name: updatedHunt.name,
          date: updatedHunt.date,
          active: updatedHunt.active
        })
        .eq('id', updatedHunt.id);
        
      if (error) throw error;
      
      setHunts(prevHunts => 
        prevHunts.map(hunt => 
          hunt.id === updatedHunt.id ? updatedHunt : hunt
        )
      );
    } catch (error) {
      console.error('Error updating hunt:', error);
      toast({
        title: "Feil ved oppdatering",
        description: "Kunne ikke oppdatere påskejakten",
        variant: "destructive"
      });
    }
  };

  const deleteHunt = async (huntId: string) => {
    try {
      const { error } = await supabase
        .from('hunts')
        .delete()
        .eq('id', huntId);
        
      if (error) throw error;
      
      setHunts(prevHunts => prevHunts.filter(hunt => hunt.id !== huntId));
      
      if (activeHuntId === huntId) {
        const remainingHunts = hunts.filter(hunt => hunt.id !== huntId);
        setActiveHuntId(remainingHunts[0]?.id || null);
      }
      
      toast({
        title: "Påskejakt slettet",
        description: "Påskejakten ble slettet",
      });
    } catch (error) {
      console.error('Error deleting hunt:', error);
      toast({
        title: "Feil ved sletting",
        description: "Kunne ikke slette påskejakten",
        variant: "destructive"
      });
    }
  };

  const addWaypoint = async (huntId: string, waypoint: Omit<Waypoint, "id" | "found">) => {
    try {
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
      
      const newWaypoint: Waypoint = {
        id: refetchedWaypointData.id,
        name: refetchedWaypointData.name,
        latitude: parseFloat(refetchedWaypointData.latitude),
        longitude: parseFloat(refetchedWaypointData.longitude),
        order: refetchedWaypointData.order_number,
        hints: hintsData.map((hint: any) => ({
          id: hint.id,
          text: hint.text,
          distanceThreshold: hint.distance_threshold,
          revealed: hint.revealed
        })),
        found: refetchedWaypointData.found,
        startingHint: refetchedWaypointData.starting_hint || undefined
      };
      
      setHunts(prevHunts => 
        prevHunts.map(hunt => {
          if (hunt.id === huntId) {
            return {
              ...hunt,
              waypoints: [...hunt.waypoints, newWaypoint]
            };
          }
          return hunt;
        })
      );
    } catch (error) {
      console.error('Error adding waypoint:', error);
      toast({
        title: "Feil ved opprettelse",
        description: "Kunne ikke legge til posten",
        variant: "destructive"
      });
    }
  };

  const updateWaypoint = async (huntId: string, updatedWaypoint: Waypoint) => {
    try {
      const { error: waypointError } = await supabase
        .from('waypoints')
        .update({
          name: updatedWaypoint.name,
          latitude: updatedWaypoint.latitude.toString(),
          longitude: updatedWaypoint.longitude.toString(),
          order_number: updatedWaypoint.order,
          starting_hint: updatedWaypoint.startingHint || null,
          found: updatedWaypoint.found
        })
        .eq('id', updatedWaypoint.id);
        
      if (waypointError) throw waypointError;
      
      const { error: deleteHintsError } = await supabase
        .from('hints')
        .delete()
        .eq('waypoint_id', updatedWaypoint.id);
        
      if (deleteHintsError) throw deleteHintsError;
      
      if (updatedWaypoint.hints && updatedWaypoint.hints.length > 0) {
        const hintsToInsert = updatedWaypoint.hints
          .filter(hint => hint.text.trim() !== '')
          .map(hint => ({
            waypoint_id: updatedWaypoint.id,
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
      
      setHunts(prevHunts => 
        prevHunts.map(hunt => {
          if (hunt.id === huntId) {
            return {
              ...hunt,
              waypoints: hunt.waypoints.map(waypoint => 
                waypoint.id === updatedWaypoint.id ? updatedWaypoint : waypoint
              )
            };
          }
          return hunt;
        })
      );
    } catch (error) {
      console.error('Error updating waypoint:', error);
      toast({
        title: "Feil ved oppdatering",
        description: "Kunne ikke oppdatere posten",
        variant: "destructive"
      });
    }
  };

  const deleteWaypoint = async (huntId: string, waypointId: string) => {
    try {
      const { error } = await supabase
        .from('waypoints')
        .delete()
        .eq('id', waypointId);
        
      if (error) throw error;
      
      setHunts(prevHunts => 
        prevHunts.map(hunt => {
          if (hunt.id === huntId) {
            return {
              ...hunt,
              waypoints: hunt.waypoints.filter(waypoint => waypoint.id !== waypointId)
            };
          }
          return hunt;
        })
      );
    } catch (error) {
      console.error('Error deleting waypoint:', error);
      toast({
        title: "Feil ved sletting",
        description: "Kunne ikke slette posten",
        variant: "destructive"
      });
    }
  };

  const setWaypointFound = async (huntId: string, waypointId: string, found: boolean) => {
    try {
      const { error } = await supabase
        .from('waypoints')
        .update({ found })
        .eq('id', waypointId);
        
      if (error) throw error;
      
      setHunts(prevHunts => 
        prevHunts.map(hunt => {
          if (hunt.id === huntId) {
            return {
              ...hunt,
              waypoints: hunt.waypoints.map(waypoint => {
                if (waypoint.id === waypointId) {
                  return { ...waypoint, found };
                }
                return waypoint;
              })
            };
          }
          return hunt;
        })
      );
      
      if (found) {
        toast({
          title: "Påskeegg funnet!",
          description: "Du har funnet et påskeegg! Gå til neste post.",
        });
      }
    } catch (error) {
      console.error('Error updating waypoint found status:', error);
      toast({
        title: "Feil ved oppdatering",
        description: "Kunne ikke oppdatere posten",
        variant: "destructive"
      });
    }
  };

  const setHintRevealed = async (huntId: string, waypointId: string, hintId: string, revealed: boolean) => {
    try {
      const { error } = await supabase
        .from('hints')
        .update({ revealed })
        .eq('id', hintId);
        
      if (error) throw error;
      
      setHunts(prevHunts => 
        prevHunts.map(hunt => {
          if (hunt.id === huntId) {
            return {
              ...hunt,
              waypoints: hunt.waypoints.map(waypoint => {
                if (waypoint.id === waypointId) {
                  return {
                    ...waypoint,
                    hints: waypoint.hints.map(hint => {
                      if (hint.id === hintId) {
                        return { ...hint, revealed };
                      }
                      return hint;
                    })
                  };
                }
                return waypoint;
              })
            };
          }
          return hunt;
        })
      );
      
      if (revealed) {
        toast({
          title: "Nytt hint",
          description: "Et nytt hint er tilgjengelig!",
        });
      }
    } catch (error) {
      console.error('Error updating hint revealed status:', error);
      toast({
        title: "Feil ved oppdatering",
        description: "Kunne ikke oppdatere hintet",
        variant: "destructive"
      });
    }
  };

  const moveToNextWaypoint = async () => {
    if (!activeHunt || !currentWaypoint) return;
    
    const sortedWaypoints = [...activeHunt.waypoints].sort((a, b) => a.order - b.order);
    
    const currentIndex = sortedWaypoints.findIndex(wp => wp.id === currentWaypoint.id);
    
    if (currentIndex !== -1 && !sortedWaypoints[currentIndex].found) {
      await setWaypointFound(activeHunt.id, currentWaypoint.id, true);
    }
  };

  useEffect(() => {
    if (isHuntCompleted && activeHunt) {
      toast({
        title: "Gratulerer!",
        description: "Du har fullført påskejakten!",
      });
    }
  }, [isHuntCompleted, activeHunt, toast]);

  const value = {
    hunts,
    activeHunt,
    currentWaypoint,
    setActiveHunt,
    addHunt,
    updateHunt,
    deleteHunt,
    addWaypoint,
    updateWaypoint,
    deleteWaypoint,
    setWaypointFound,
    setHintRevealed,
    moveToNextWaypoint,
    progressPercentage,
    isHuntCompleted,
    isLoading
  };

  return <HuntContext.Provider value={value}>{children}</HuntContext.Provider>;
};
