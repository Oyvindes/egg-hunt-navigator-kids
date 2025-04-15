import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, Navigation } from 'lucide-react';
import { useHunt } from '@/contexts/hunt';
import { useLocation } from '@/contexts/LocationContext';
import { getActiveUserLocations } from '@/integrations/supabase/locationTrackerService';
import { UserLocation } from '@/integrations/supabase/types';
import MapComponent from './MapComponent';

const LiveMap: React.FC = () => {
  const [loading, setLoading] = useState(false);
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
          {/* Use the Leaflet map component */}
          <div className="rounded-lg overflow-hidden">
            {combinedLocations.length === 0 ? (
              <div className="h-80 w-full flex items-center justify-center bg-blue-50 text-blue-800 font-medium border border-blue-100 rounded-lg">
                Ingen aktive deltakere funnet
              </div>
            ) : (
              /* Render the actual map when we have locations */
              <MapComponent locations={combinedLocations} />
            )}
          </div>
          
          {/* User list with dark blue text */}
          <div className="space-y-2 mt-4">
            <h3 className="text-sm font-medium text-blue-800">Aktive deltakere:</h3>
            {combinedLocations.map((loc) => (
              <div key={loc.user_id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium text-dark-blue">{loc.display_name || 'Ukjent bruker'}</span>
                    <div className="text-xs text-blue-600 mt-1">
                      {loc.last_waypoint ? 
                        `Sist ved: ${loc.last_waypoint}` : 
                        `Sist aktiv: ${loc.timestamp instanceof Date ? 
                          loc.timestamp.toLocaleTimeString() : 
                          new Date(loc.timestamp).toLocaleTimeString()}`
                      }
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-blue-600">
                    <Navigation className="h-3 w-3 mr-1 text-dark-blue" />
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