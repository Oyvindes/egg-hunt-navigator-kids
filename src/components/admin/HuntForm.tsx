
import React, { useState } from 'react';
import { useHunt } from '@/contexts/HuntContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const HuntForm = () => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const { addHunt } = useHunt();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    addHunt({
      name,
      date: date || undefined,
      waypoints: [],
      active: false,
    });
    
    // Reset form
    setName('');
    setDate('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow-md">
      <div className="space-y-2">
        <Label htmlFor="hunt-name">Navn på påskejakten</Label>
        <Input
          id="hunt-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="F.eks. Påskejakt i parken"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hunt-date">Dato (valgfritt)</Label>
        <Input
          id="hunt-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      
      <Button type="submit" className="w-full">Legg til påskejakt</Button>
    </form>
  );
};

export default HuntForm;
