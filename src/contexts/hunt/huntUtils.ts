
import { Hunt, Waypoint } from '@/lib/types';

export function findNextWaypoint(waypoints: Waypoint[]): Waypoint | null {
  const sortedWaypoints = [...waypoints].sort((a, b) => a.order - b.order);
  return sortedWaypoints.find(wp => !wp.found) || null;
}

export function calculateProgress(waypoints: Waypoint[]): {
  progressPercentage: number;
  isCompleted: boolean;
} {
  const totalWaypoints = waypoints.length;
  const foundWaypoints = waypoints.filter(wp => wp.found).length;
  const progressPercentage = totalWaypoints > 0 ? (foundWaypoints / totalWaypoints) * 100 : 0;
  const isCompleted = totalWaypoints > 0 && foundWaypoints === totalWaypoints;
  
  return { progressPercentage, isCompleted };
}
