import React, { useEffect, useState } from 'react';
import CompassArrow from './CompassArrow';
import TemperatureIndicator from './TemperatureIndicator';
import DistanceMeter from './DistanceMeter';
import HintsList from './HintsList';
import PhotoSubmit from './PhotoSubmit';
import { useLocation } from '@/contexts/LocationContext';
import { useHunt } from '@/contexts/hunt';
import { calculateDistance, isWaypointFound, getAvailableHints } from '@/lib/geo-utils';
import { Button } from '@/components/ui/button';
import { Hint } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Info } from 'lucide-react';
import { hasPendingSubmission } from '@/integrations/supabase/photoService';

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
    isLoading,
    resetHunt
  } = useHunt();
  const [distance, setDistance] = useState<number | null>(null);
  const [processingRevealedHints, setProcessingRevealedHints] = useState<Set<string>>(new Set());
  const [showPhotoSubmit, setShowPhotoSubmit] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);
  const [shouldCheckCompletion, setShouldCheckCompletion] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(false);
  const [localHuntCompleted, setLocalHuntCompleted] = useState(false);

  // Start tracking location when component mounts
  useEffect(() => {
    if (!isTracking) {
      startTracking();
    }
  }, [isTracking, startTracking]);
  
  // Check for pending submission
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (!activeHunt || !currentWaypoint) return;
      
      setCheckingSubmission(true);
      try {
        const isPending = await hasPendingSubmission(activeHunt.id, currentWaypoint.id);
        
        // If we had a pending submission that's now gone, trigger completion check
        if (pendingSubmission && !isPending) {
          setShouldCheckCompletion(true);
        }
        
        setPendingSubmission(isPending);
      } catch (error) {
        console.error('Error checking submission status:', error);
      } finally {
        setCheckingSubmission(false);
      }
    };
    
    checkSubmissionStatus();
    
    // Set up polling to check status every 5 seconds
    const interval = setInterval(checkSubmissionStatus, 5000);
    return () => clearInterval(interval);
  }, [activeHunt, currentWaypoint, pendingSubmission]);

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
  
  
  // Check for hunt completion when a photo is approved
  useEffect(() => {
    if (!shouldCheckCompletion || !activeHunt) return;
    
    // Reset the flag
    setShouldCheckCompletion(false);
    
    // Check if this was the last waypoint in the hunt
    const waypointsCount = activeHunt.waypoints.length;
    const foundWaypoints = activeHunt.waypoints.filter(wp => wp.found).length;
    
    // Check if our approved submission is for the last pending waypoint
    const isLastWaypointPending = foundWaypoints === waypointsCount - 1 &&
                                 currentWaypoint &&
                                 !currentWaypoint.found;
    
    // If all waypoints are now found, or we just got approval for the last one, show completion
    if (foundWaypoints === waypointsCount || isLastWaypointPending) {
      // Mark our local hunt as completed to show celebration screen
      setLocalHuntCompleted(true);
      console.log("All waypoints found! Hunt completed!");
    } else {
      // Move to the next waypoint automatically
      moveToNextWaypoint();
    }
  }, [shouldCheckCompletion, activeHunt, moveToNextWaypoint, currentWaypoint]);

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

  if (isHuntCompleted || localHuntCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-8">
        <div className="w-full max-w-md p-6 bg-black/50 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-yellow-400/70 transform hover:scale-[1.01] transition-transform duration-300">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                src="https://emojipedia-us.s3.amazonaws.com/source/skype/289/party-popper_1f389.png"
                alt="Celebration"
                className="w-28 h-28 object-contain animate-bounce-subtle"
              />
              <img
                src="https://em-content.zobj.net/thumbs/120/apple/354/hatching-chick_1f423.png"
                alt="Easter chick"
                className="w-16 h-16 object-contain absolute -bottom-2 -right-2 animate-pulse"
              />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-yellow-400">Gratulerer Hedda og Oscar!</h2>
          <p className="text-lg mb-2 text-white">Kos dere med godteriet! Glad i dere!</p>
          <p className="text-lg mb-4 text-pink-300 font-bold">Hilsen Pappa ❤</p>
          
          {/* Yellow info box removed */}
          
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setLocalHuntCompleted(false);
                resetHunt();
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white border-none rounded-full shadow-lg transform hover:translate-y-[-2px] transition-all duration-300"
            >
              Start på nytt
            </Button>
          </div>
        </div>
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
      <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-600/50 transform hover:scale-[1.01] transition-transform duration-300">
        <h2 className="text-xl font-semibold mb-1 text-white">{currentWaypoint.name}</h2>
        <p className="text-sm text-gray-300">Post {currentWaypoint.order} av {activeHunt.waypoints.length}</p>
        
        <div className="mt-4">
          <Progress value={progressPercentage} className="h-3 bg-gray-800" />
          <p className="text-sm text-gray-300 mt-1">{Math.round(progressPercentage)}% fullført</p>
        </div>
        
        {currentWaypoint.startingHint && (
          <div className="mt-4 bg-blue-500/20 backdrop-blur-sm border-l-4 border-blue-400 p-3 rounded-r text-sm flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-300" />
            <span className="text-blue-800">{currentWaypoint.startingHint}</span>
          </div>
        )}
      </div>
      {/* Navigation section */}
      <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-600/50 transform hover:scale-[1.01] transition-transform duration-300">
        <h3 className="text-sm font-medium mb-3 text-gray-200">Navigasjon</h3>
        
        <CompassArrow
          targetLatitude={currentWaypoint.latitude}
          targetLongitude={currentWaypoint.longitude}
        />
      </div>
      
      {distance !== null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TemperatureIndicator distance={distance} />
          <DistanceMeter distance={distance} />
        </div>
      )}
      
      <HintsList hints={currentWaypoint.hints} />
      
      {showPhotoSubmit ? (
        <PhotoSubmit
          huntId={activeHunt.id}
          waypointId={currentWaypoint.id}
          onSubmitSuccess={() => {
            setShowPhotoSubmit(false);
            setPendingSubmission(true);
          }}
          onCancel={() => setShowPhotoSubmit(false)}
        />
      ) : (
        <div className="mt-8 text-center">
          {checkingSubmission ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary mr-2"></div>
              <span className="text-gray-500">Sjekker bildeinnleveringer...</span>
            </div>
          ) : pendingSubmission ? (
            <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-4 text-center shadow-lg">
              <p className="text-yellow-300 font-medium mb-2">Bildet ditt er sendt til godkjenning</p>
              <p className="text-yellow-200 text-sm mb-3">Vent på at bildet blir godkjent før du fortsetter</p>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    // Refresh to check if the submission was approved
                    setCheckingSubmission(true);
                    
                    // Manually check submission status
                    try {
                      const isPending = await hasPendingSubmission(activeHunt.id, currentWaypoint.id);
                      
                      // If submission is no longer pending, trigger completion check
                      if (!isPending) {
                        setPendingSubmission(false);
                        
                        // Check if this was the last waypoint in the hunt
                        const waypointsCount = activeHunt.waypoints.length;
                        const foundWaypoints = activeHunt.waypoints.filter(wp => wp.found).length;
                        
                        // If this is the last waypoint, show celebration immediately
                        if (foundWaypoints === waypointsCount - 1) {
                          setLocalHuntCompleted(true);
                        } else {
                          setShouldCheckCompletion(true);
                        }
                      } else {
                        setPendingSubmission(true);
                      }
                    } catch (error) {
                      console.error('Error checking submission status:', error);
                    } finally {
                      setCheckingSubmission(false);
                    }
                  }}
                  className="bg-yellow-500/30 hover:bg-yellow-500/50 text-yellow-100 border-yellow-500/30 rounded-full"
                >
                  Sjekk status
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowPhotoSubmit(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white border-none shadow-lg transform hover:translate-y-[-2px] transition-all duration-300 rounded-full"
            >
              Jeg har funnet påskeegget! Ta bilde
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default HuntNavigation;
