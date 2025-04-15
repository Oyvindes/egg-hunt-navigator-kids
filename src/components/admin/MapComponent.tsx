import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { UserLocation } from '@/integrations/supabase/types';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Define the interface for props
interface MapComponentProps {
  locations: UserLocation[];
}

// Handle default icon issues
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent: React.FC<MapComponentProps> = ({ locations }) => {
  // Create map after component mounts
  useEffect(() => {
    // Check if map container exists and there's no map already
    const container = document.getElementById('map-container');
    if (!container || (container as any)._leaflet_id) {
      return;
    }

    // Default center - Oslo, Norway
    let mapCenter: [number, number] = [59.9139, 10.7522];
    
    // If we have locations, use the first one's coordinates
    if (locations.length > 0) {
      mapCenter = [locations[0].latitude, locations[0].longitude];
    }

    // Initialize map
    const map = L.map('map-container').setView(mapCenter, 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add markers for each location
    locations.forEach(loc => {
      // Create a custom icon for the user
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `<div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white">${(loc.display_name || 'U').charAt(0)}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      
      // Add marker
      const marker = L.marker([loc.latitude, loc.longitude], { icon: userIcon })
        .addTo(map);

      // Add popup with user info
      marker.bindPopup(`
        <div class="p-1">
          <div class="font-medium text-blue-800">${loc.display_name || 'Ukjent bruker'}</div>
          <div class="text-xs text-gray-500">
            ${loc.last_waypoint ? 
              `Sist ved: ${loc.last_waypoint}` : 
              `Sist aktiv: ${new Date(loc.timestamp).toLocaleTimeString()}`
            }
          </div>
          <div class="text-xs text-gray-500">
            Nøyaktighet: ${Math.round(loc.accuracy)}m
          </div>
        </div>
      `);

      // Add accuracy circle
      L.circle([loc.latitude, loc.longitude], {
        radius: loc.accuracy,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        weight: 1,
        opacity: 0.5
      }).addTo(map);
    });

    // Cleanup function
    return () => {
      map.remove();
    };
  }, [locations]); // Re-initialize map when locations change

  return (
    <div 
      id="map-container" 
      className="h-80 w-full rounded-lg border border-gray-300"
      style={{ zIndex: 0 }}
    ></div>
  );
};

export default MapComponent;