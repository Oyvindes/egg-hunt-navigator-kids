
import React, { useEffect, useState } from 'react';
import { ArrowUp, Compass } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';
import { calculateBearing } from '@/lib/geo-utils';

interface CompassArrowProps {
  targetLatitude: number;
  targetLongitude: number;
}

const CompassArrow = ({ targetLatitude, targetLongitude }: CompassArrowProps) => {
  const { latitude, longitude, heading } = useLocation();
  const [arrowRotation, setArrowRotation] = useState(0);
  
  useEffect(() => {
    if (latitude && longitude && targetLatitude && targetLongitude) {
      // Calculate bearing to the target
      const bearing = calculateBearing(latitude, longitude, targetLatitude, targetLongitude);
      
      // Adjust for device heading if available
      const adjustedRotation = heading !== null 
        ? (bearing - heading + 360) % 360
        : bearing;
        
      setArrowRotation(adjustedRotation);
    }
  }, [latitude, longitude, heading, targetLatitude, targetLongitude]);

  return (
    <div className="flex items-center justify-center p-4">
      <div className="relative w-28 h-28 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
        <Compass className="absolute opacity-30 w-20 h-20 text-white animate-spin-slow" />
        <ArrowUp 
          className="compass-arrow text-white h-16 w-16 z-10 drop-shadow-md"
          style={{ transform: `rotate(${arrowRotation}deg)` }}
        />
      </div>
    </div>
  );
};

export default CompassArrow;
