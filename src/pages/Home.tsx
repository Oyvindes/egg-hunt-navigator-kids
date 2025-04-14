
import React from 'react';
import HuntNavigation from '@/components/HuntNavigation';
import { Button } from '@/components/ui/button';
import { MapPin, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHunt } from '@/contexts/HuntContext';

const Home = () => {
  const navigate = useNavigate();
  const { activeHunt } = useHunt();
  
  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Påskejakt</h1>
          {activeHunt && <p className="text-sm">{activeHunt.name}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="relative">
        {/* Easter egg decorations */}
        <div className="absolute -top-12 -left-8 w-20 h-20 opacity-70 egg-shadow">
          <img src="https://emojipedia-us.s3.amazonaws.com/source/skype/289/egg_1f95a.png" alt="Egg" className="w-full h-full object-contain" />
        </div>
        <div className="absolute -top-6 -right-6 w-16 h-16 rotate-12 opacity-70 egg-shadow">
          <img src="https://emojipedia-us.s3.amazonaws.com/source/skype/289/rabbit-face_1f430.png" alt="Rabbit" className="w-full h-full object-contain" />
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-primary">
          <HuntNavigation />
        </div>
      </div>
    </div>
  );
};

export default Home;
