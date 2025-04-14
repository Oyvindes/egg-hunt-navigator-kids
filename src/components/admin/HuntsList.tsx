
import React from 'react';
import { useHunt } from '@/contexts/HuntContext';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Egg } from 'lucide-react';
import { Hunt } from '@/lib/types';

interface HuntsListProps {
  onEdit?: (hunt: Hunt) => void;
}

const HuntsList = ({ onEdit }: HuntsListProps) => {
  const { hunts, deleteHunt, setActiveHunt, activeHunt } = useHunt();
  
  if (hunts.length === 0) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <p>Ingen påskejakter funnet. Opprett en ny jakt ovenfor.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {hunts.map(hunt => (
        <div 
          key={hunt.id} 
          className={`bg-white p-4 rounded-lg shadow-md border-2 ${
            activeHunt?.id === hunt.id ? 'border-primary' : 'border-transparent'
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">{hunt.name}</h3>
              {hunt.date && (
                <p className="text-sm text-gray-500">Dato: {hunt.date}</p>
              )}
              <p className="text-sm">
                Poster: {hunt.waypoints.length} 
                {hunt.waypoints.length > 0 && (
                  <span className="ml-2 text-gray-500">
                    ({hunt.waypoints.filter(wp => wp.found).length} funnet)
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant={activeHunt?.id === hunt.id ? "secondary" : "outline"} 
                size="sm"
                onClick={() => setActiveHunt(hunt.id)}
              >
                {activeHunt?.id === hunt.id ? 'Aktiv' : 'Aktiver'}
              </Button>
              
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(hunt)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (window.confirm(`Er du sikker på at du vil slette "${hunt.name}"?`)) {
                    deleteHunt(hunt.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          
          {hunt.waypoints.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm font-medium mb-2">Poster:</p>
              <div className="flex flex-wrap gap-2">
                {hunt.waypoints
                  .sort((a, b) => a.order - b.order)
                  .map(waypoint => (
                    <div 
                      key={waypoint.id}
                      className={`text-xs px-3 py-1 rounded-full flex items-center ${
                        waypoint.found ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <Egg className="h-3 w-3 mr-1" />
                      {waypoint.name}
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HuntsList;
