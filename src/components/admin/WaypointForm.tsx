
import React, { useState } from 'react';
import { useHunt } from '@/contexts/hunt';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Hint, Waypoint } from '@/lib/types';
import MapPicker from './MapPicker';

interface WaypointFormProps {
  huntId: string;
  waypointToEdit?: Waypoint | null;
  onComplete?: () => void;
}

const WaypointForm = ({ huntId, waypointToEdit, onComplete }: WaypointFormProps) => {
  const { addWaypoint, updateWaypoint, activeHunt } = useHunt();
  const [name, setName] = useState(waypointToEdit?.name || '');
  const [latitude, setLatitude] = useState(waypointToEdit?.latitude ? waypointToEdit.latitude.toString() : '');
  const [longitude, setLongitude] = useState(waypointToEdit?.longitude ? waypointToEdit.longitude.toString() : '');
  const [order, setOrder] = useState(waypointToEdit?.order ? waypointToEdit.order.toString() : '');
  const [startingHint, setStartingHint] = useState(waypointToEdit?.startingHint || '');

  const defaultHints = waypointToEdit?.hints
    ? waypointToEdit.hints.map(hint => ({
        text: hint.text,
        distanceThreshold: hint.distanceThreshold
      }))
    : [
        { text: '', distanceThreshold: 100 },
        { text: '', distanceThreshold: 50 },
        { text: '', distanceThreshold: 15 },
      ];
  
  const [hints, setHints] = useState<Omit<Hint, "id" | "revealed">[]>(defaultHints);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !latitude || !longitude || !order) return;
    
    // Convert hints to the proper format
    const formattedHints = hints
      .filter(hint => hint.text.trim() !== '')
      .map((hint, index) => ({
        // Keep existing id for existing hints, or create a new one
        id: waypointToEdit?.hints?.[index]?.id || `new-${Date.now()}-${index}`,
        text: hint.text,
        distanceThreshold: hint.distanceThreshold,
        revealed: waypointToEdit?.hints?.[index]?.revealed || false,
      }));
    
    const waypointData = {
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      order: parseInt(order),
      hints: formattedHints,
      startingHint: startingHint.trim() || undefined,
    };
    
    if (waypointToEdit) {
      // Update existing waypoint
      updateWaypoint(huntId, {
        ...waypointData,
        id: waypointToEdit.id,
        found: waypointToEdit.found
      });
    } else {
      // Create new waypoint
      addWaypoint(huntId, waypointData);
    }
    
    // Reset form
    setName('');
    setLatitude('');
    setLongitude('');
    setOrder('');
    setStartingHint('');
    setHints([
      { text: '', distanceThreshold: 100 },
      { text: '', distanceThreshold: 50 },
      { text: '', distanceThreshold: 15 },
    ]);
    
    if (onComplete) {
      onComplete();
    }
  };

  const updateHint = (index: number, field: keyof Omit<Hint, "id" | "revealed">, value: string | number) => {
    const newHints = [...hints];
    newHints[index] = { ...newHints[index], [field]: value };
    setHints(newHints);
  };

  const getNextOrderNumber = () => {
    if (!activeHunt) return 1;
    const maxOrder = Math.max(0, ...activeHunt.waypoints.map(wp => wp.order));
    return maxOrder + 1;
  };

  React.useEffect(() => {
    // Only auto-set order for new waypoints, not when editing
    if (!waypointToEdit) {
      setOrder(getNextOrderNumber().toString());
    }
  }, [activeHunt?.waypoints.length, waypointToEdit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        {waypointToEdit ? `Rediger: ${waypointToEdit.name}` : 'Legg til ny post'}
      </h2>
      <div className="space-y-2">
        <Label htmlFor="waypoint-name">Navn på post</Label>
        <Input
          id="waypoint-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="F.eks. Påskeegg #1"
          required
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium">Plassering</h3>
        
        {/* Map Picker */}
        <MapPicker
          latitude={latitude}
          longitude={longitude}
          onPositionChange={(lat, lng) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
        />
        
        {/* Still keep manual input for precision adjustments */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="waypoint-lat">Breddegrad (latitude)</Label>
            <Input
              id="waypoint-lat"
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="f.eks. 59.91273"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="waypoint-lng">Lengdegrad (longitude)</Label>
            <Input
              id="waypoint-lng"
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="f.eks. 10.74609"
              required
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="waypoint-order">Rekkefølge</Label>
        <Input
          id="waypoint-order"
          type="number"
          min="1"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          placeholder="1, 2, 3..."
          required
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium">Hint</h3>
        
        {hints.map((hint, index) => (
          <div key={index} className="space-y-2 border border-gray-200 p-3 rounded-md">
            <div className="flex items-center justify-between">
              <Label htmlFor={`hint-${index}`}>Hint {index + 1}</Label>
              <span className="text-xs text-gray-500">
                Vises ved ≤ {hint.distanceThreshold}m
              </span>
            </div>
            
            <Input
              id={`hint-${index}`}
              value={hint.text}
              onChange={(e) => updateHint(index, 'text', e.target.value)}
              placeholder="Skriv hint her..."
            />
            
            <div className="space-y-1">
              <Label htmlFor={`threshold-${index}`} className="text-xs">
                Avstandsterskel (meter)
              </Label>
              <Input
                id={`threshold-${index}`}
                type="number"
                min="1"
                value={hint.distanceThreshold}
                onChange={(e) => updateHint(index, 'distanceThreshold', parseInt(e.target.value))}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="starting-hint">Starthint</Label>
        <Input
          id="starting-hint"
          value={startingHint}
          onChange={(e) => setStartingHint(e.target.value)}
          placeholder="Skriv et starthint som hjelper deltakerne i gang"
        />
      </div>
      
      <Button type="submit" className="w-full">
        {waypointToEdit ? 'Oppdater post' : 'Legg til post'}
      </Button>
    </form>
  );
};

export default WaypointForm;
