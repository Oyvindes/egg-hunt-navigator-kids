
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Hunt, Waypoint, Hint } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

// Sample data - in a real app this would come from a database
const defaultHint: Hint[] = [
  { id: '1', text: 'Se etter noe som skinner', distanceThreshold: 100, revealed: false },
  { id: '2', text: 'Det er fargerikt og gjemt under noe', distanceThreshold: 50, revealed: false },
  { id: '3', text: 'Sjekk bak den store steinen', distanceThreshold: 15, revealed: false }
];

const defaultWaypoints: Waypoint[] = [
  {
    id: '1',
    name: 'Påskeegg #1',
    latitude: 59.91273, 
    longitude: 10.74609,
    order: 1,
    hints: [...defaultHint],
    found: false
  },
  {
    id: '2',
    name: 'Påskeegg #2',
    latitude: 59.91349, 
    longitude: 10.74683,
    order: 2,
    hints: [
      { id: '4', text: 'Under noe grønt', distanceThreshold: 100, revealed: false },
      { id: '5', text: 'Nær vann', distanceThreshold: 50, revealed: false },
      { id: '6', text: 'Ved foten av et tre', distanceThreshold: 15, revealed: false }
    ],
    found: false
  },
  {
    id: '3',
    name: 'Påskeegg #3',
    latitude: 59.91328,
    longitude: 10.74512,
    order: 3,
    hints: [
      { id: '7', text: 'Der barna leker', distanceThreshold: 100, revealed: false },
      { id: '8', text: 'Nær en huske', distanceThreshold: 50, revealed: false },
      { id: '9', text: 'Under en benk', distanceThreshold: 15, revealed: false }
    ],
    found: false
  }
];

const defaultHunts: Hunt[] = [
  {
    id: '1',
    name: 'Påskejakt i parken',
    date: '2025-04-15',
    waypoints: defaultWaypoints,
    active: true
  },
  {
    id: '2',
    name: 'Påskejakt i hagen',
    date: '2025-04-16',
    waypoints: [],
    active: false
  }
];

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
});

export const useHunt = () => useContext(HuntContext);

interface HuntProviderProps {
  children: ReactNode;
}

export const HuntProvider = ({ children }: HuntProviderProps) => {
  const [hunts, setHunts] = useState<Hunt[]>(defaultHunts);
  const [activeHuntId, setActiveHuntId] = useState<string | null>(defaultHunts[0]?.id || null);
  const { toast } = useToast();
  
  // Compute the active hunt
  const activeHunt = hunts.find(hunt => hunt.id === activeHuntId) || null;
  
  // Compute the current waypoint (the first non-found waypoint)
  const currentWaypoint = activeHunt?.waypoints.find(wp => !wp.found) || null;
  
  // Calculate progress percentage
  const totalWaypoints = activeHunt?.waypoints.length || 0;
  const foundWaypoints = activeHunt?.waypoints.filter(wp => wp.found).length || 0;
  const progressPercentage = totalWaypoints > 0 ? (foundWaypoints / totalWaypoints) * 100 : 0;
  
  // Check if hunt is completed
  const isHuntCompleted = totalWaypoints > 0 && foundWaypoints === totalWaypoints;
  
  // Set the active hunt
  const setActiveHunt = (huntId: string) => {
    const huntExists = hunts.some(hunt => hunt.id === huntId);
    if (huntExists) {
      setActiveHuntId(huntId);
    }
  };

  // Add a new hunt
  const addHunt = (hunt: Omit<Hunt, "id">) => {
    const newHunt: Hunt = {
      ...hunt,
      id: Date.now().toString(),
    };
    
    setHunts(prevHunts => [...prevHunts, newHunt]);
    
    toast({
      title: "Påskejakt opprettet",
      description: `${newHunt.name} ble opprettet`,
    });
  };

  // Update an existing hunt
  const updateHunt = (updatedHunt: Hunt) => {
    setHunts(prevHunts => 
      prevHunts.map(hunt => 
        hunt.id === updatedHunt.id ? updatedHunt : hunt
      )
    );
  };

  // Delete a hunt
  const deleteHunt = (huntId: string) => {
    setHunts(prevHunts => prevHunts.filter(hunt => hunt.id !== huntId));
    
    // If the active hunt is deleted, set the first available hunt as active
    if (activeHuntId === huntId) {
      const remainingHunts = hunts.filter(hunt => hunt.id !== huntId);
      setActiveHuntId(remainingHunts[0]?.id || null);
    }
    
    toast({
      title: "Påskejakt slettet",
      description: "Påskejakten ble slettet",
    });
  };

  // Add a waypoint to a hunt
  const addWaypoint = (huntId: string, waypoint: Omit<Waypoint, "id" | "found">) => {
    const newWaypoint: Waypoint = {
      ...waypoint,
      id: Date.now().toString(),
      found: false,
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
  };

  // Update a waypoint
  const updateWaypoint = (huntId: string, updatedWaypoint: Waypoint) => {
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
  };

  // Delete a waypoint
  const deleteWaypoint = (huntId: string, waypointId: string) => {
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
  };

  // Mark a waypoint as found
  const setWaypointFound = (huntId: string, waypointId: string, found: boolean) => {
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
  };

  // Mark a hint as revealed
  const setHintRevealed = (huntId: string, waypointId: string, hintId: string, revealed: boolean) => {
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
  };

  // Move to the next waypoint
  const moveToNextWaypoint = () => {
    if (!activeHunt || !currentWaypoint) return;
    
    // Sort waypoints by order
    const sortedWaypoints = [...activeHunt.waypoints].sort((a, b) => a.order - b.order);
    
    // Find the index of the current waypoint
    const currentIndex = sortedWaypoints.findIndex(wp => wp.id === currentWaypoint.id);
    
    // If current waypoint is found, mark it as found
    if (currentIndex !== -1 && !sortedWaypoints[currentIndex].found) {
      setWaypointFound(activeHunt.id, currentWaypoint.id, true);
    }
  };

  // Monitor for hunt completion
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
    isHuntCompleted
  };

  return <HuntContext.Provider value={value}>{children}</HuntContext.Provider>;
};
