
import React, { useState } from 'react';
import { useHunt } from '@/contexts/hunt';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="hunt-name" className="text-gray-700 font-medium">Navn på påskejakten</Label>
        <Input
          id="hunt-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="F.eks. Påskejakt i parken"
          className="border-gray-300 focus:border-primary focus:ring-primary"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hunt-date" className="text-gray-700 font-medium">Dato (valgfritt)</Label>
        <div className="relative">
          <Input
            id="hunt-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border-gray-300 focus:border-primary focus:ring-primary"
            placeholder="dd.mm.åååå"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <Calendar size={18} />
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-4"
      >
        Legg til påskejakt
      </Button>
    </form>
  );
};

export default HuntForm;
