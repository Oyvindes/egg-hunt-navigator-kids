
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Hunt, Waypoint } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { HuntContextProps } from './types';
import {
  fetchHunts,
  updateActiveHunt,
  createHunt,
  updateHuntData,
  removeHunt,
  createWaypoint,
  modifyWaypoint,
  removeWaypoint,
  updateWaypointFoundStatus,
  updateHintRevealedStatus
} from './huntService';
import { findNextWaypoint, calculateProgress } from './huntUtils';

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
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const huntsData = await fetchHunts();
        setHunts(huntsData);
        
        if (huntsData.length > 0) {
          const activeHunt = huntsData.find(h => h.active);
          setActiveHuntId(activeHunt ? activeHunt.id : huntsData[0].id);
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
    
    loadInitialData();
  }, [toast]);
  
  const activeHunt = hunts.find(hunt => hunt.id === activeHuntId) || null;
  const currentWaypoint = activeHunt ? findNextWaypoint(activeHunt.waypoints) : null;
  
  const { progressPercentage, isCompleted: isHuntCompleted } = activeHunt 
    ? calculateProgress(activeHunt.waypoints) 
    : { progressPercentage: 0, isCompleted: false };
  
  const setActiveHunt = async (huntId: string) => {
    const huntExists = hunts.some(hunt => hunt.id === huntId);
    if (huntExists) {
      setActiveHuntId(huntId);
      
      try {
        await updateActiveHunt(huntId);
        
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
      const data = await createHunt(hunt);
      
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
      await updateHuntData(updatedHunt);
      
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
      await removeHunt(huntId);
      
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
      // Cast latitude and longitude to string explicitly to satisfy TypeScript
      const { waypointData, hintsData } = await createWaypoint(huntId, {
        ...waypoint,
        latitude: waypoint.latitude as unknown as string,
        longitude: waypoint.longitude as unknown as string
      });
      
      const newWaypoint: Waypoint = {
        id: waypointData.id,
        name: waypointData.name,
        latitude: parseFloat(waypointData.latitude as string),
        longitude: parseFloat(waypointData.longitude as string),
        order: waypointData.order_number,
        hints: hintsData.map((hint: any) => ({
          id: hint.id,
          text: hint.text,
          distanceThreshold: hint.distance_threshold,
          revealed: hint.revealed
        })),
        found: waypointData.found,
        startingHint: waypointData.starting_hint || undefined
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
      // Cast latitude and longitude to string explicitly to satisfy TypeScript
      await modifyWaypoint(updatedWaypoint.id, {
        ...updatedWaypoint,
        latitude: updatedWaypoint.latitude as unknown as string,
        longitude: updatedWaypoint.longitude as unknown as string
      });
      
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
      await removeWaypoint(waypointId);
      
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
      await updateWaypointFoundStatus(waypointId, found);
      
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
      await updateHintRevealedStatus(hintId, revealed);
      
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
