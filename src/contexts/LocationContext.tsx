import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

interface LocationContextProps {
  latitude: number | null;
  longitude: number | null;
  heading: number | null;
  accuracy: number | null;
  error: string | null;
  isTracking: boolean;
  isCompassActive: boolean;
  isDevelopmentMode: boolean;
  toggleDevelopmentMode: () => void;
  setMockLocation: (lat: number, lng: number) => void;
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
  isCompassActive: false,
  isDevelopmentMode: false,
  toggleDevelopmentMode: () => {},
  setMockLocation: () => {},
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
  const [deviceOrientation, setDeviceOrientation] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isCompassActive, setIsCompassActive] = useState(false);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);
  const { toast } = useToast();

  const toggleDevelopmentMode = () => {
    setIsDevelopmentMode(!isDevelopmentMode);
  };
  
  const setMockLocation = (lat: number, lng: number) => {
    if (isDevelopmentMode) {
      setLocation({
        latitude: lat,
        longitude: lng,
        heading: 0,
        accuracy: 10,
      });
    } else {
      console.warn("Cannot set mock location when not in development mode");
    }
  };

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

  const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha !== null) {
      setDeviceOrientation(event.alpha);
      setIsCompassActive(true);
    }
  };

  const startDeviceOrientation = () => {
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
      setIsCompassActive(true);
    }
  };

  const stopDeviceOrientation = () => {
    window.removeEventListener('deviceorientation', handleDeviceOrientation);
    setIsCompassActive(false);
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
    
    try {
      const iosPermissionAPI = window.DeviceOrientationEvent &&
        typeof DeviceOrientationEvent.requestPermission === 'function';
        
      if (iosPermissionAPI) {
        DeviceOrientationEvent.requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              startDeviceOrientation();
            } else {
              console.log('Device orientation permission denied');
            }
          })
          .catch((err: any) => {
            console.error('Error requesting device orientation permission:', err);
          });
      } else if (window.DeviceOrientationEvent) {
        startDeviceOrientation();
      }
    } catch (err) {
      console.log('Device orientation not supported or error occurred');
    }
    
    const id = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 2000
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
    
    stopDeviceOrientation();
  };

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
        heading: location.heading || deviceOrientation,
        accuracy: location.accuracy,
        error,
        isTracking,
        isCompassActive,
        isDevelopmentMode,
        toggleDevelopmentMode,
        setMockLocation,
        startTracking,
        stopTracking
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
