
import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
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
      <div className="relative w-24 h-24 bg-easter-blue rounded-full flex items-center justify-center shadow-lg">
        <ArrowUp 
          className="compass-arrow text-primary h-16 w-16"
          style={{ transform: `rotate(${arrowRotation}deg)` }}
        />
      </div>
    </div>
  );
};

export default CompassArrow;
