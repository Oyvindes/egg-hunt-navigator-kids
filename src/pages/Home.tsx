
import React, { useEffect, useState } from 'react';
import HuntNavigation from '@/components/HuntNavigation';
import { Button } from '@/components/ui/button';
import { Settings, Egg, Rabbit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHunt } from '@/contexts/hunt';

const getRandomPosition = () => {
  return {
    top: Math.random() * 80 + 10 + '%',
    left: Math.random() * 80 + 10 + '%',
    animationDelay: Math.random() * 2 + 's'
  };
};

const Home = () => {
  const navigate = useNavigate();
  const { activeHunt, isLoading } = useHunt();
  const [eggPositions, setEggPositions] = useState<Array<{top: string, left: string, animationDelay: string}>>([]);
  
  useEffect(() => {
    // Create 5 randomly positioned eggs
    const positions = Array.from({length: 5}, () => getRandomPosition());
    setEggPositions(positions);
  }, []);
  
  return (
    <div className="min-h-screen bg-background container max-w-md mx-auto p-4 relative overflow-hidden">
      {/* Animated Easter decorations */}
      {eggPositions.map((pos, i) => (
        <div 
          key={i} 
          className="absolute opacity-20 z-0 animate-float" 
          style={{ 
            top: pos.top, 
            left: pos.left, 
            animationDelay: pos.animationDelay 
          }}
        >
          {i % 2 === 0 ? (
            <Egg className="h-8 w-8 text-yellow-400" />
          ) : (
            <Rabbit className="h-8 w-8 text-pink-300" />
          )}
        </div>
      ))}
      
      <div className="flex flex-col items-center justify-center mb-6 relative z-10 text-center">
        <h1 className="text-3xl font-bold relative">
          <span className="inline-block gold-3d-text">
            Oscar og Heddas påskejakt!
            <span className="absolute -top-1 -right-2 animate-bounce-subtle">
              <Egg className="h-5 w-5 text-yellow-500" />
            </span>
          </span>
        </h1>
        {activeHunt && (
          <p className="text-sm bg-primary/20 text-primary inline-block px-2 py-1 rounded-full mt-2">
            {activeHunt.name}
          </p>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/admin')}
          className="absolute top-0 right-0 bg-primary/10 hover:bg-primary/20 rounded-full"
        >
          <Settings className="h-5 w-5 text-primary" />
        </Button>
      </div>
      
      <div className="relative z-10">
        <div className="bg-card rounded-lg p-6 shadow-lg border border-gray-800">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <HuntNavigation />
          )}
        </div>
      </div>
      
      <div className="fixed bottom-4 right-4 z-10 animate-spin-slow">
        <Egg className="h-8 w-8 text-yellow-400" />
      </div>
    </div>
  );
};

export default Home;
