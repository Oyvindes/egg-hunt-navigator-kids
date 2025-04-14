import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

// Import leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapPickerProps {
  latitude: string;
  longitude: string;
  onPositionChange: (lat: string, lng: string) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ 
  latitude, 
  longitude, 
  onPositionChange 
}) => {
  // Default to Oslo coordinates if none provided
  const initialLat = latitude ? parseFloat(latitude) : 59.9139;
  const initialLng = longitude ? parseFloat(longitude) : 10.7522;
  
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(position, 13);
      
      // Add the OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
      
      // Add a marker at the initial position
      markerRef.current = L.marker(position).addTo(mapRef.current);
      
      // Add click handler to map
      mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        handlePositionChange(lat, lng);
      });
    }
    
    return () => {
      // Clean up on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);
  
  // Update marker position when coordinates change
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng(position);
      mapRef.current.panTo(position);
    }
  }, [position]);

  // Update the parent component when position changes
  const handlePositionChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onPositionChange(lat.toFixed(6), lng.toFixed(6));
  };

  // Use current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handlePositionChange(latitude, longitude);
        },
        (error) => {
          console.error("Error getting current location:", error);
          alert("Kunne ikke hente din posisjon. Sjekk at du har gitt tilgang til posisjon.");
        }
      );
    } else {
      alert("Geolocation støttes ikke av din nettleser.");
    }
  };

  // Sync with parent component props
  useEffect(() => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng) && 
          (lat !== position[0] || lng !== position[1])) {
        setPosition([lat, lng]);
      }
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between mb-2">
        <p className="text-sm text-gray-500">Klikk på kartet for å velge posisjon</p>
        <Button 
          type="button" 
          size="sm" 
          variant="outline" 
          onClick={getCurrentLocation}
          className="flex items-center gap-1"
        >
          <Navigation className="h-4 w-4" />
          <span>Min posisjon</span>
        </Button>
      </div>
      <div 
        ref={mapContainerRef} 
        className="h-[300px] w-full rounded-md overflow-hidden border border-gray-200"
      />
      <div className="flex gap-2 text-xs text-gray-500 mt-1">
        <MapPin className="h-4 w-4" />
        <span>Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}</span>
      </div>
    </div>
  );
};

export default MapPicker;