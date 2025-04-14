
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map, Plus, Sparkles } from 'lucide-react';
import HuntForm from '@/components/admin/HuntForm';
import HuntsList from '@/components/admin/HuntsList';
import WaypointForm from '@/components/admin/WaypointForm';
import WaypointsList from '@/components/admin/WaypointsList';
import { useHunt } from '@/contexts/HuntContext';
import { Hunt, Waypoint } from '@/lib/types';

const Admin = () => {
  const navigate = useNavigate();
  const { activeHunt } = useHunt();
  const [showAddWaypoint, setShowAddWaypoint] = useState(false);
  const [editingWaypoint, setEditingWaypoint] = useState<Waypoint | null>(null);
  
  const handleBackClick = () => {
    navigate('/');
  };
  
  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackClick} 
            className="bg-easter-pink hover:bg-easter-purple rounded-full"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </Button>
          <h1 className="text-2xl font-bold ml-2 text-primary flex items-center">
            Admin
            <Sparkles className="h-4 w-4 ml-2 text-yellow-400" />
          </h1>
        </div>
        
        <Button
          variant="outline"
          onClick={handleBackClick}
          className="text-primary border-primary hover:bg-primary/10"
        >
          Tilbake til hovedsiden
        </Button>
      </div>
      
      <div className="relative">
        {/* Easter egg decorations */}
        <div className="absolute -top-8 -right-6 w-16 h-16 rotate-12 opacity-70 egg-shadow animate-bounce-subtle">
          <img src="https://emojipedia-us.s3.amazonaws.com/source/skype/289/magic-wand_1fa84.png" alt="Magic wand" className="w-full h-full object-contain" />
        </div>
        
        <Tabs defaultValue="hunts" className="card-glow bg-white rounded-lg p-4 shadow-md">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-easter-yellow">
            <TabsTrigger value="hunts" className="data-[state=active]:bg-primary data-[state=active]:text-white">Påskejakter</TabsTrigger>
            <TabsTrigger value="waypoints" disabled={!activeHunt} className="data-[state=active]:bg-primary data-[state=active]:text-white">Poster</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hunts" className="space-y-4">
            <HuntForm />
            <HuntsList />
          </TabsContent>
          
          <TabsContent value="waypoints" className="space-y-4">
            {activeHunt && (
              <>
                <div className="bg-easter-green rounded-lg p-4 shadow-md border-2 border-primary/50">
                  <h2 className="font-semibold">Poster for: <span className="text-primary">{activeHunt.name}</span></h2>
                  
                  {!showAddWaypoint ? (
                    <Button 
                      onClick={() => setShowAddWaypoint(true)}
                      className="w-full mt-4 bg-secondary hover:bg-secondary/80 text-white btn-bounce"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Legg til ny post
                    </Button>
                  ) : (
                    <>
                      <WaypointForm 
                        huntId={activeHunt.id}
                        onComplete={() => setShowAddWaypoint(false)}
                      />
                      <Button 
                        onClick={() => setShowAddWaypoint(false)}
                        className="w-full mt-2"
                        variant="ghost"
                      >
                        Avbryt
                      </Button>
                    </>
                  )}
                </div>
                
                <WaypointsList huntId={activeHunt.id} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
