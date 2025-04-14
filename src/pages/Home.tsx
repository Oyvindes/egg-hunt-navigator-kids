
import React, { useEffect, useState } from 'react';
import HuntNavigation from '@/components/HuntNavigation';
import { Button } from '@/components/ui/button';
import { Settings, Egg, Rabbit, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHunt } from '@/contexts/hunt';
import { useLocation } from '@/contexts/LocationContext';

const getRandomPosition = () => {
  return {
    top: -10 - (Math.random() * 40) + '%', // Start above the screen
    left: Math.random() * 100 + '%', // Random horizontal position
    animationDelay: Math.random() * 10 + 's', // Random delay to start falling
    animationDuration: 5 + Math.random() * 10 + 's', // Random fall speed
    opacity: 0.4 + Math.random() * 0.6 // Random opacity
  };
};

const Home = () => {
  const navigate = useNavigate();
  const { activeHunt, isLoading } = useHunt();
  const { error, startTracking } = useLocation();
  const [eggPositions, setEggPositions] = useState<Array<{top: string, left: string, animationDelay: string, animationDuration: string, opacity: number}>>([]);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  
  useEffect(() => {
    const positions = Array.from({length: 20}, () => getRandomPosition());
    setEggPositions(positions);
    
    // Check for location permission on app start
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        if (permissionStatus.state === 'denied') {
          setShowPermissionDialog(true);
        } else if (permissionStatus.state === 'prompt') {
          setShowPermissionDialog(true);
        }
      }).catch(() => {
        // If we can't check permission status, try to get location once
        navigator.geolocation.getCurrentPosition(
          () => {}, // Success - permission granted
          () => setShowPermissionDialog(true), // Error - likely permission denied
          { timeout: 3000 }
        );
      });
    }
  }, []);
  
  // Show permission dialog again if there's a GPS error
  useEffect(() => {
    if (error && error.includes("tillatelse")) {
      setShowPermissionDialog(true);
    }
  }, [error]);
  
  return (
    <div className="min-h-screen bg-black container max-w-md mx-auto p-4 relative overflow-hidden">
      {eggPositions.map((pos, i) => (
        <div
          key={i}
          className="absolute z-0"
          style={{
            top: pos.top,
            left: pos.left,
            opacity: pos.opacity,
            animation: `falling ${pos.animationDuration} linear infinite`,
            animationDelay: pos.animationDelay
          }}
        >
          {i % 2 === 0 ? (
            <Egg className={`h-8 w-8 ${i % 4 === 0 ? 'text-yellow-400' : 'text-yellow-200'}`} />
          ) : (
            <Rabbit className={`h-8 w-8 ${i % 4 === 1 ? 'text-pink-300' : 'text-pink-200'}`} />
          )}
        </div>
      ))}
      
      <div className="flex flex-col items-center justify-center mb-6 relative z-10 text-center">
        <h1 className="text-3xl font-bold relative">
          <span className="gold-3d-text inline-block">
            Oscar og Heddas påskejakt!
            <span className="absolute -top-1 -right-2 animate-bounce-subtle">
              <Egg className="h-5 w-5 text-yellow-500" />
            </span>
          </span>
        </h1>
        {activeHunt && (
          <p className="text-sm bg-yellow-500/20 text-yellow-400 inline-block px-2 py-1 rounded-full mt-2 backdrop-blur-sm border border-yellow-500/20">
            {activeHunt.name}
          </p>
        )}
      </div>
      
      <div className="relative z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-600/50 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
          {showPermissionDialog ? (
            <div className="flex flex-col items-center justify-center text-center p-4 h-64">
              <AlertCircle className="h-12 w-12 text-yellow-400 mb-4" />
              <h2 className="text-xl font-bold mb-2 text-white">GPS-tillatelse kreves</h2>
              <p className="mb-4 text-gray-200">Påskejakten trenger å få tilgang til din posisjon for å fungere. Vennligst gi tilgang når nettleseren spør.</p>
              <Button
                className="mt-2 bg-primary hover:bg-primary/90 text-white flex items-center"
                onClick={() => {
                  startTracking();
                  setShowPermissionDialog(false);
                }}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Gi tilgang til GPS
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
              <p className="mt-4 text-gray-200">Laster inn...</p>
            </div>
          ) : (
            <HuntNavigation />
          )}
        </div>
      </div>
      
      <div className="fixed bottom-4 right-4 z-10 animate-spin-slow">
        <Egg className="h-8 w-8 text-yellow-400" />
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/admin')}
        className="fixed bottom-4 left-4 z-10 bg-black hover:bg-black/80 rounded-full p-3"
      >
        <Settings className="h-5 w-5 text-white" />
      </Button>
    </div>
  );
};

export default Home;
