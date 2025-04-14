
import React, { useEffect, useState } from 'react';
import CompassArrow from './CompassArrow';
import TemperatureIndicator from './TemperatureIndicator';
import DistanceMeter from './DistanceMeter';
import HintsList from './HintsList';
import { useLocation } from '@/contexts/LocationContext';
import { useHunt } from '@/contexts/hunt';
import { calculateDistance, isWaypointFound, getAvailableHints } from '@/lib/geo-utils';
import { Button } from '@/components/ui/button';
import { Hint } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Info } from 'lucide-react';

const HuntNavigation = () => {
  const { latitude, longitude, isTracking, startTracking } = useLocation();
  const { 
    activeHunt, 
    currentWaypoint, 
    setWaypointFound, 
    setHintRevealed,
    moveToNextWaypoint,
    progressPercentage,
    isHuntCompleted,
    isLoading
  } = useHunt();
  const [distance, setDistance] = useState<number | null>(null);
  const [processingRevealedHints, setProcessingRevealedHints] = useState<Set<string>>(new Set());

  // Start tracking location when component mounts
  useEffect(() => {
    if (!isTracking) {
      startTracking();
    }
  }, [isTracking, startTracking]);

  // Calculate distance and update hints when location changes
  useEffect(() => {
    if (!latitude || !longitude || !currentWaypoint) return;
    
    const calculatedDistance = calculateDistance(
      latitude,
      longitude,
      currentWaypoint.latitude,
      currentWaypoint.longitude
    );
    
    setDistance(calculatedDistance);
    
    // Check if waypoint is found
    if (isWaypointFound(calculatedDistance) && activeHunt) {
      moveToNextWaypoint();
    }
    
    // Process hints based on distance
    if (activeHunt) {
      const availableHints = getAvailableHints(currentWaypoint.hints, calculatedDistance);
      
      availableHints.forEach(hint => {
        if (!hint.revealed && !processingRevealedHints.has(hint.id)) {
          setProcessingRevealedHints(prev => new Set(prev).add(hint.id));
          
          setHintRevealed(activeHunt.id, currentWaypoint.id, hint.id, true);
        }
      });
    }
  }, [latitude, longitude, currentWaypoint, activeHunt, moveToNextWaypoint, setHintRevealed, processingRevealedHints]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Laster påskejakt...</p>
      </div>
    );
  }

  if (!activeHunt) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-4">Ingen aktiv påskejakt</h2>
        <p>Velg en påskejakt for å starte</p>
      </div>
    );
  }

  if (isHuntCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-24 h-24 mb-4">
          <img src="https://emojipedia-us.s3.amazonaws.com/source/skype/289/party-popper_1f389.png" alt="Celebration" className="w-full h-full object-contain animate-bounce-subtle" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Gratulerer!</h2>
        <p className="text-lg mb-4">Du har fullført påskejakten!</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Start på nytt
        </Button>
      </div>
    );
  }

  if (!currentWaypoint) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-4">Ingen flere poster</h2>
        <p>Alle påskeegg er funnet!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-4 shadow-md">
        <h2 className="text-xl font-semibold mb-1">{currentWaypoint.name}</h2>
        <p className="text-sm text-gray-500">Post {currentWaypoint.order} av {activeHunt.waypoints.length}</p>
        
        <div className="mt-4">
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-sm text-gray-500 mt-1">{Math.round(progressPercentage)}% fullført</p>
        </div>
        
        {currentWaypoint.startingHint && (
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r text-sm flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-500" />
            <span>{currentWaypoint.startingHint}</span>
          </div>
        )}
      </div>
      
      {distance !== null && distance > 100 ? (
        <CompassArrow 
          targetLatitude={currentWaypoint.latitude} 
          targetLongitude={currentWaypoint.longitude} 
        />
      ) : null}
      
      {distance !== null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TemperatureIndicator distance={distance} />
          <DistanceMeter distance={distance} />
        </div>
      )}
      
      <HintsList hints={currentWaypoint.hints} />
      
      <div className="mt-8 text-center">
        <Button 
          variant="outline"
          onClick={() => {
            if (activeHunt && currentWaypoint) {
              setWaypointFound(activeHunt.id, currentWaypoint.id, true);
            }
          }}
        >
          Jeg har funnet påskeegget!
        </Button>
      </div>
    </div>
  );
};

export default HuntNavigation;
