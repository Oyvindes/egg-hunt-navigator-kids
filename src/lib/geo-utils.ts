
/**
 * Calculate the distance between two coordinates in meters using the Haversine formula
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate the bearing between two coordinates
 * @returns Bearing in degrees (0-360)
 */
export function calculateBearing(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const λ1 = (lon1 * Math.PI) / 180;
  const λ2 = (lon2 * Math.PI) / 180;

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const θ = Math.atan2(y, x);

  return ((θ * 180) / Math.PI + 360) % 360;
}

/**
 * Determines temperature based on distance
 */
export function getTemperature(distance: number): "ice" | "cold" | "warm" | "hot" {
  if (distance > 100) return "ice";
  if (distance > 50) return "cold";
  if (distance > 15) return "warm";
  return "hot";
}

/**
 * Get the appropriate hints for the current distance
 */
export function getAvailableHints(hints: Hint[], distance: number): Hint[] {
  return hints
    .filter(hint => hint.distanceThreshold >= distance)
    .sort((a, b) => b.distanceThreshold - a.distanceThreshold);
}

/**
 * Check if a waypoint is considered "found"
 */
export function isWaypointFound(distance: number): boolean {
  return distance < 5; // Less than 5 meters is considered "found"
}

export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)} meter`;
  } else {
    return `${(distance / 1000).toFixed(2)} km`;
  }
}
