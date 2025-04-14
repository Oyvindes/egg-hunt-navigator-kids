
import { Hunt, Waypoint, Hint } from '@/lib/types';

export interface HuntContextProps {
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
  resetHunt: () => void;
  progressPercentage: number;
  isHuntCompleted: boolean;
  isLoading: boolean;
}
