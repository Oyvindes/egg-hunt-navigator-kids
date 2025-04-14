
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

interface LocationContextProps {
  latitude: number | null;
  longitude: number | null;
  heading: number | null;
  accuracy: number | null;
  error: string | null;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

const LocationContext = createContext<LocationContextProps>({
  latitude: null,
  longitude: null,
  heading: null,
  accuracy: null,
  error: null,
  isTracking: false,
  startTracking: () => {},
  stopTracking: () => {}
});

export const useLocation = () => useContext(LocationContext);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    heading: number | null;
    accuracy: number | null;
  }>({
    latitude: null,
    longitude: null,
    heading: null,
    accuracy: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  const handlePositionSuccess = (position: GeolocationPosition) => {
    setLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      heading: position.coords.heading || null,
      accuracy: position.coords.accuracy,
    });
    setError(null);
  };

  const handlePositionError = (geolocationError: GeolocationPositionError) => {
    let errorMessage: string;
    
    switch (geolocationError.code) {
      case 1:
        errorMessage = "Du må gi tillatelse til å bruke GPS";
        break;
      case 2:
        errorMessage = "Kunne ikke finne posisjon";
        break;
      case 3:
        errorMessage = "Tidsavbrudd ved posisjonering";
        break;
      default:
        errorMessage = "Ukjent feil ved GPS";
    }
    
    setError(errorMessage);
    toast({
      title: "GPS-feil",
      description: errorMessage,
      variant: "destructive"
    });
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation støttes ikke av denne nettleseren");
      toast({
        title: "Feil",
        description: "Geolocation støttes ikke av denne nettleseren",
        variant: "destructive"
      });
      return;
    }

    if (watchId !== null) {
      // Already tracking
      return;
    }

    setIsTracking(true);
    
    const id = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
    
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <LocationContext.Provider
      value={{
        latitude: location.latitude,
        longitude: location.longitude,
        heading: location.heading,
        accuracy: location.accuracy,
        error,
        isTracking,
        startTracking,
        stopTracking
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
