
import React from 'react';
import HuntNavigation from '@/components/HuntNavigation';
import { Button } from '@/components/ui/button';
import { MapPin, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHunt } from '@/contexts/HuntContext';

const Home = () => {
  const navigate = useNavigate();
  const { activeHunt, isLoading } = useHunt();
  
  return (
    <div className="min-h-screen bg-background container max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Påskejakt</h1>
          {activeHunt && <p className="text-sm bg-primary/20 text-primary inline-block px-2 py-1 rounded-full">{activeHunt.name}</p>}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/admin')}
          className="bg-primary/10 hover:bg-primary/20 rounded-full"
        >
          <Settings className="h-5 w-5 text-primary" />
        </Button>
      </div>
      
      <div className="relative">
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
    </div>
  );
};

export default Home;
