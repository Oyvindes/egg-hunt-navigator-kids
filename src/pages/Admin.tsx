
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map, Plus } from 'lucide-react';
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
  
  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold ml-2">Admin</h1>
        </div>
      </div>
      
      <Tabs defaultValue="hunts">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="hunts">Påskejakter</TabsTrigger>
          <TabsTrigger value="waypoints" disabled={!activeHunt}>Poster</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hunts" className="space-y-4">
          <HuntForm />
          <HuntsList />
        </TabsContent>
        
        <TabsContent value="waypoints" className="space-y-4">
          {activeHunt && (
            <>
              <div className="bg-white rounded-lg p-4 shadow-md">
                <h2 className="font-semibold">Poster for: {activeHunt.name}</h2>
                
                {!showAddWaypoint ? (
                  <Button 
                    onClick={() => setShowAddWaypoint(true)}
                    className="w-full mt-4"
                    variant="outline"
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
  );
};

export default Admin;
