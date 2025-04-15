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
  userId: string | null;
  displayName: string | null;
  setUserInfo: (userId: string, name: string) => void;
  toggleDevelopmentMode: () => void;
  hasLocationConsent: boolean;
  setLocationConsent: (consent: boolean) => void;
  setMockLocation: (lat: number, lng: number) => void;
  startTracking: () => void;
  stopTracking: () => void;
  activeUsers: {
    userId: string;
    displayName: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  }[];
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
  userId: null,
  displayName: null,
  setUserInfo: () => {},
  toggleDevelopmentMode: () => {},
  hasLocationConsent: false,
  setLocationConsent: () => {},
  setMockLocation: () => {},
  startTracking: () => {},
  stopTracking: () => {},
  activeUsers: []
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
  const [userId, setUserId] = useState<string | null>(null);
  const [hasLocationConsent, setHasLocationConsent] = useState<boolean>(() => {
    // Check if consent has been previously given
    return localStorage.getItem('locationSharingConsent') === 'true';
  });
  const [displayName, setDisplayName] = useState<string | null>(null);
  
  // Mock active users for the admin map view
  const [activeUsers, setActiveUsers] = useState<Array<{
    userId: string;
    displayName: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: Date;
  }>>([
    // Seed with some initial mock data
    {
      userId: 'user1',
      displayName: 'Hedda',
      latitude: 59.9138,
      longitude: 10.7387,
      accuracy: 10,
      timestamp: new Date(),
    },
    {
      userId: 'user2',
      displayName: 'Oscar',
      latitude: 59.9139,
      longitude: 10.7390,
      accuracy: 8,
      timestamp: new Date(),
    }
  ]);
  
  const { toast } = useToast();

  const toggleDevelopmentMode = () => {
    setIsDevelopmentMode(!isDevelopmentMode);
  };
  
  const setUserInfo = (newUserId: string, name: string) => {
    setUserId(newUserId);
    setDisplayName(name);
  };
  
  // Function to set location sharing consent
  const setLocationConsent = (consent: boolean) => {
    setHasLocationConsent(consent);
    if (consent) {
      localStorage.setItem('locationSharingConsent', 'true');
    } else {
      localStorage.removeItem('locationSharingConsent');
    }
  };
  
  const setMockLocation = (lat: number, lng: number) => {
    if (isDevelopmentMode) {
      setLocation({
        latitude: lat,
        longitude: lng,
        heading: 0,
        accuracy: 10,
      });
      
      // Also update in active users list if we have user info
      if (userId && displayName) {
        updateActiveUserLocation(userId, displayName, lat, lng, 10);
      }
    } else {
      console.warn("Cannot set mock location when not in development mode");
    }
  };
  
  // Helper to update the active users array
  const updateActiveUserLocation = (
    userId: string, 
    displayName: string, 
    latitude: number, 
    longitude: number, 
    accuracy: number
  ) => {
    setActiveUsers(prev => {
      // Check if this user already exists in the array
      const existingIndex = prev.findIndex(u => u.userId === userId);
      
      if (existingIndex >= 0) {
        // Update existing user
        const newArray = [...prev];
        newArray[existingIndex] = {
          ...newArray[existingIndex],
          latitude,
          longitude, 
          accuracy,
          timestamp: new Date()
        };
        return newArray;
      } else {
        // Add new user
        return [...prev, {
          userId,
          displayName,
          latitude,
          longitude,
          accuracy,
          timestamp: new Date()
        }];
      }
    });
  };

  const handlePositionSuccess = (position: GeolocationPosition) => {
    const newLatitude = position.coords.latitude;
    const newLongitude = position.coords.longitude;
    const newAccuracy = position.coords.accuracy;
    
    setLocation({
      latitude: newLatitude,
      longitude: newLongitude,
      heading: position.coords.heading || null,
      accuracy: newAccuracy,
    });
    
    // Update active users list with the current user's position
    if (userId && displayName) {
      updateActiveUserLocation(userId, displayName, newLatitude, newLongitude, newAccuracy);
    }
    
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
    // Check for consent before starting tracking
    if (!hasLocationConsent && !isDevelopmentMode) {
      console.log("Location tracking requires consent");
      return;
    }
    
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
        typeof (DeviceOrientationEvent as any).requestPermission === 'function';
        
      if (iosPermissionAPI) {
        (DeviceOrientationEvent as any).requestPermission()
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
        userId,
        displayName,
        setUserInfo,
        toggleDevelopmentMode,
        setMockLocation,
        hasLocationConsent,
        setLocationConsent,
        startTracking,
        stopTracking,
        activeUsers
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
