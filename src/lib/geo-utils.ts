import { Hint } from './types';

const R = 6371e3; // Radius of earth in meters

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = R * c;
  return d;
};

export const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const λ1 = lon1 * Math.PI/180;
  const λ2 = lon2 * Math.PI/180;

  const y = Math.sin(λ2-λ1) * Math.cos(φ2);
  const x = Math.cos(φ1)*Math.sin(φ2) -
          Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
  let θ = Math.atan2(y, x);
  θ = θ * 180/Math.PI; // Convert to degrees
  return (θ + 360) % 360; // Normalize to 0-360 range
};

export const formatDistance = (distance: number): string => {
  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  } else {
    return `${(distance / 1000).toFixed(1)} km`;
  }
};

export const isWaypointFound = (distance: number): boolean => {
  return distance <= 20;
};

export const getTemperature = (distance: number): 'ice' | 'cold' | 'warm' | 'hot' => {
  if (distance > 200) {
    return 'ice';
  } else if (distance > 100) {
    return 'cold';
  } else if (distance > 50) {
    return 'warm';
  } else {
    return 'hot';
  }
};

export const getAvailableHints = (hints: Hint[], distance: number): Hint[] => {
  return hints.filter(hint => distance <= hint.distanceThreshold);
};
