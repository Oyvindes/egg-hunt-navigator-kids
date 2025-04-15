import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Navigation } from 'lucide-react';
import { useHunt } from '@/contexts/hunt';
import { useLocation } from '@/contexts/LocationContext';
import { getActiveUserLocations } from '@/integrations/supabase/locationTrackerService';
import { UserLocation } from '@/integrations/supabase/types';

const LiveMap: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [locationData, setLocationData] = useState<UserLocation[]>([]);
  const { activeHunt } = useHunt();
  // We'll still use activeUsers from context as a fallback/initial data source
  const { activeUsers } = useLocation();
  
  // Refresh locations - get real data from the database
  const refreshLocations = async () => {
    if (!activeHunt) return;
    
    setLoading(true);
    try {
      const locations = await getActiveUserLocations(activeHunt.id);
      setLocationData(locations);
      console.log('Fetched', locations.length, 'active user locations');
    } catch (error) {
      console.error('Error fetching user locations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load effect and polling
  useEffect(() => {
    if (activeHunt) {
      refreshLocations();
      
      // Poll for updates every 10 seconds
      const interval = setInterval(refreshLocations, 10000);
      return () => clearInterval(interval);
    }
  }, [activeHunt]);
  
  // Initialize map and update markers
  useEffect(() => {
    // Combine data from both sources, prioritizing database data
    const combinedData = [...locationData];
    
    // Only add activeUsers entries that don't exist in locationData
    if (locationData.length === 0) {
      // Convert activeUsers to match our UserLocation interface
      activeUsers.forEach(user => {
        combinedData.push({
          user_id: user.userId,
          hunt_id: activeHunt?.id || '',
          latitude: user.latitude,
          longitude: user.longitude,
          accuracy: user.accuracy,
          timestamp: user.timestamp,
          display_name: user.displayName,
          last_waypoint: undefined
        });
      });
    }
    
    // Initialize map when component loads and we have locations
    if (mapRef.current && combinedData.length > 0 && !mapInitialized) {
      initializeMap();
    }
    
    // Update markers when locations change
    if (mapInitialized && combinedData.length > 0) {
      updateMapMarkers();
    }
  }, [locationData, activeUsers, mapInitialized, activeHunt]);
  
  const initializeMap = () => {
    // In a real implementation, this would initialize a mapping library like Leaflet or Google Maps
    console.log('Map would be initialized here');
    setMapInitialized(true);
  };
  
  const updateMapMarkers = () => {
    // In a real implementation, this would update the map markers
    console.log('Map markers would be updated here');
  };
  
  // Convert activeUsers to match our UserLocation interface
  const convertedActiveUsers: UserLocation[] = activeUsers.map(u => ({
    user_id: u.userId,
    hunt_id: activeHunt?.id || '',
    latitude: u.latitude,
    longitude: u.longitude,
    accuracy: u.accuracy,
    timestamp: u.timestamp,
    display_name: u.displayName,
    last_waypoint: undefined
  }));
  
  // Combine data from both sources, removing duplicates
  const combinedLocations = [...locationData];
  
  // Only add convertedActiveUsers entries that don't exist in locationData
  convertedActiveUsers.forEach(user => {
    if (!locationData.find(loc => loc.user_id === user.user_id)) {
      combinedLocations.push(user);
    }
  });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-primary" />
          Sporingsvisning
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => refreshLocations()}
          className="flex items-center"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> Laster...
            </span>
          ) : (
            <span className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-1" /> Oppdater
            </span>
          )}
        </Button>
      </div>
      
      {!activeHunt ? (
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Ingen aktiv påskejakt</h3>
          <p className="text-yellow-700">Du må velge en aktiv påskejakt først.</p>
        </div>
      ) : (
        <>
          {/* This div would contain the actual map in a real implementation */}
          <div 
            ref={mapRef}
            className="bg-blue-50 border border-blue-100 rounded-lg h-64 w-full flex items-center justify-center relative overflow-hidden"
          >
            {combinedLocations.length === 0 ? (
              <div className="text-center text-blue-600">Ingen aktive deltakere funnet</div>
            ) : (
              // This is a mock map UI - in a real app, we'd use a proper mapping library
              <>
                {/* Map container with background */}
                <div className="absolute inset-0 bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-400 opacity-30 text-4xl font-light">Kartet</span>
                </div>
                
                {/* User markers */}
                {combinedLocations.map((loc) => (
                  <div 
                    key={loc.user_id}
                    className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      // This positioning is just for demo - in a real app we'd use proper geo coordinates
                      left: `${50 + (loc.longitude - 10.739) * 5000}%`,
                      top: `${50 + (loc.latitude - 59.914) * 5000}%`,
                    }}
                  >
                    <div className="relative">
                      <div className="absolute -inset-2 bg-blue-500 opacity-20 rounded-full animate-ping"></div>
                      <div className="absolute -inset-4 border-2 border-blue-400 opacity-30 rounded-full"></div>
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {(loc.display_name || 'U').charAt(0)}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          
          {/* User list */}
          <div className="space-y-2 mt-4">
            <h3 className="text-sm font-medium text-gray-700">Aktive deltakere:</h3>
            {combinedLocations.map((loc) => (
              <div key={loc.user_id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-primary">{loc.display_name || 'Ukjent bruker'}</span>
                    <div className="text-xs text-gray-500 mt-1">
                      {loc.last_waypoint ? 
                        `Sist ved: ${loc.last_waypoint}` : 
                        `Sist aktiv: ${loc.timestamp instanceof Date ? 
                          loc.timestamp.toLocaleTimeString() : 
                          new Date(loc.timestamp).toLocaleTimeString()}`
                      }
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Navigation className="h-3 w-3 mr-1 text-blue-500" />
                    {Math.round(loc.accuracy)}m nøyaktighet
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LiveMap;