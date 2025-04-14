
import React from 'react';
import { useHunt } from '@/contexts/HuntContext';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Egg, Calendar } from 'lucide-react';
import { Hunt } from '@/lib/types';

interface HuntsListProps {
  onEdit?: (hunt: Hunt) => void;
}

const HuntsList = ({ onEdit }: HuntsListProps) => {
  const { hunts, deleteHunt, setActiveHunt, activeHunt } = useHunt();
  
  if (hunts.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Ingen påskejakter funnet. Opprett en ny jakt ovenfor.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 mt-8">
      <h3 className="font-medium text-gray-700 mb-2">Dine påskejakter</h3>
      {hunts.map(hunt => (
        <div 
          key={hunt.id} 
          className={`bg-white p-4 rounded-lg shadow-sm border ${
            activeHunt?.id === hunt.id ? 'border-[#8B5CF6]' : 'border-gray-100'
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">{hunt.name}</h3>
              {hunt.date && (
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  {hunt.date}
                </p>
              )}
              <p className="text-sm mt-1">
                <span className="font-medium">Poster:</span> {hunt.waypoints.length} 
                {hunt.waypoints.length > 0 && (
                  <span className="ml-1 text-gray-500">
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
                className={activeHunt?.id === hunt.id ? 
                  "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white" : 
                  "border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10"
                }
              >
                {activeHunt?.id === hunt.id ? 'Aktiv' : 'Aktiver'}
              </Button>
              
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  onClick={() => onEdit(hunt)}
                >
                  <Pencil className="h-4 w-4 text-gray-500" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100"
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
              <div className="flex flex-wrap gap-2">
                {hunt.waypoints
                  .sort((a, b) => a.order - b.order)
                  .map(waypoint => (
                    <div 
                      key={waypoint.id}
                      className={`text-xs px-3 py-1.5 rounded-full flex items-center ${
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
