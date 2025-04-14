
export interface Waypoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  order: number;
  hints: Hint[];
  found: boolean;
}

export interface Hint {
  id: string;
  text: string;
  distanceThreshold: number; // in meters
  revealed: boolean;
}

export interface Hunt {
  id: string;
  name: string;
  date?: string;
  waypoints: Waypoint[];
  active: boolean;
}
