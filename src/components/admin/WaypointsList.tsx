
import React from 'react';
import { useHunt } from '@/contexts/hunt';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MapPin } from 'lucide-react';
import { Waypoint } from '@/lib/types';

interface WaypointsListProps {
  huntId: string;
  onEdit?: (waypoint: Waypoint) => void;
}

const WaypointsList = ({ huntId, onEdit }: WaypointsListProps) => {
  const { hunts, deleteWaypoint } = useHunt();
  
  const hunt = hunts.find(h => h.id === huntId);
  if (!hunt) return null;
  
  if (hunt.waypoints.length === 0) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <p>Ingen poster funnet. Legg til en ny post ovenfor.</p>
      </div>
    );
  }
  
  // Sort waypoints by order
  const sortedWaypoints = [...hunt.waypoints].sort((a, b) => a.order - b.order);
  
  return (
    <div className="space-y-4">
      {sortedWaypoints.map(waypoint => (
        <div 
          key={waypoint.id} 
          className="bg-white p-4 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center">
                <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  {waypoint.order}
                </div>
                <h3 className="font-semibold">{waypoint.name}</h3>
              </div>
              
              <p className="text-sm text-gray-500 mt-1">
                {waypoint.latitude.toFixed(5)}, {waypoint.longitude.toFixed(5)}
              </p>
              
              <p className="text-sm mt-1">
                {waypoint.hints.length} hint
                {waypoint.hints.length === 0 || waypoint.hints.length > 1 ? '' : ''}
              </p>
            </div>
            
            <div className="flex space-x-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(waypoint)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (window.confirm(`Er du sikker på at du vil slette "${waypoint.name}"?`)) {
                    deleteWaypoint(huntId, waypoint.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          
          {waypoint.hints.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium">Hint:</p>
              {waypoint.hints
                .sort((a, b) => b.distanceThreshold - a.distanceThreshold)
                .map((hint, index) => (
                  <div 
                    key={hint.id}
                    className="text-xs bg-gray-50 p-2 rounded"
                  >
                    <span className="font-medium">≤ {hint.distanceThreshold}m: </span>
                    {hint.text}
                  </div>
                ))
              }
            </div>
          )}
          
          {waypoint.startingHint && (
            <div className="mt-3 bg-gray-50 p-2 rounded text-sm">
              <span className="font-medium">Starthinst: </span>
              {waypoint.startingHint}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WaypointsList;
