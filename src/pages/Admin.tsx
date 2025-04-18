
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Map, Plus, Sparkles, Image, MapPin } from 'lucide-react';
import { Waypoint } from '@/lib/types';
import HuntForm from '@/components/admin/HuntForm';
import HuntsList from '@/components/admin/HuntsList';
import WaypointForm from '@/components/admin/WaypointForm';
import WaypointsList from '@/components/admin/WaypointsList';
import PinCodeEntry from '@/components/admin/PinCodeEntry';
import PhotoApproval from '@/components/admin/PhotoApproval';
import LiveMap from '@/components/admin/LiveMap';
import { useHunt } from '@/contexts/hunt';

const Admin = () => {
  const navigate = useNavigate();
  const { activeHunt, isLoading } = useHunt();
  const [showAddWaypoint, setShowAddWaypoint] = useState(false);
  const [editingWaypoint, setEditingWaypoint] = useState<Waypoint | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated from localStorage
    // If the user is coming directly to /admin without having previously authenticated,
    // we want to ensure they're prompted for the PIN
    const adminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    setIsAuthenticated(adminAuthenticated);
  }, []);
  
  // Always reset authentication when component mounts to enforce PIN entry on each admin visit
  useEffect(() => {
    // Forcing PIN entry on every admin page access
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
  }, []);
  
  const handleBackClick = () => {
    navigate('/');
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
  };
  
  const handleEditWaypoint = (waypoint: Waypoint) => {
    setEditingWaypoint(waypoint);
    setShowAddWaypoint(true);
  };
  
  const handleEditCancel = () => {
    setEditingWaypoint(null);
    setShowAddWaypoint(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-md mx-auto p-4">
        <div className="flex items-center mb-6">
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
        
        <PinCodeEntry onSuccess={handleAuthSuccess} />
      </div>
    );
  }
  
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
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-gray-600 border-gray-300 hover:bg-gray-100"
          >
            Logg ut
          </Button>
          
          <Button
            variant="outline"
            onClick={handleBackClick}
            className="text-primary border-primary hover:bg-primary/10"
          >
            Tilbake til hovedsiden
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-2xl p-8 transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Laster data...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
          <Tabs defaultValue="hunts" className="w-full">
            <TabsList className="w-full grid grid-cols-4 rounded-t-xl px-2 py-2 bg-gray-100">
              <TabsTrigger
                value="hunts"
                className="py-4 rounded-none data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white bg-white"
              >
                Påskejakter
              </TabsTrigger>
              <TabsTrigger
                value="waypoints"
                className="py-4 rounded-none data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white bg-white"
              >
                Poster
              </TabsTrigger>
              <TabsTrigger
                value="photos"
                className="py-4 rounded-none data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white bg-white flex items-center justify-center"
              >
                <Image className="h-4 w-4 mr-1" /> Bilder
              </TabsTrigger>
              <TabsTrigger
                value="tracking"
                className="py-4 rounded-none data-[state=active]:bg-[#8B5CF6] data-[state=active]:text-white bg-white flex items-center justify-center"
              >
                <MapPin className="h-4 w-4 mr-1" /> Sporing
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="hunts" className="p-6 space-y-4">
              <HuntForm />
              <HuntsList />
            </TabsContent>
            
            <TabsContent value="waypoints" className="p-6 space-y-4">
              {activeHunt ? (
                <>
                  <div className="bg-easter-green/10 rounded-lg p-4 shadow-sm border border-primary/20">
                    <h2 className="font-semibold">Poster for: <span className="text-primary">{activeHunt.name}</span></h2>
                    
                    {!showAddWaypoint ? (
                      <Button
                        onClick={() => setShowAddWaypoint(true)}
                        className="w-full mt-4 bg-secondary hover:bg-secondary/80 text-white"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Legg til ny post
                      </Button>
                    ) : (
                      <>
                        <WaypointForm
                          huntId={activeHunt.id}
                          waypointToEdit={editingWaypoint}
                          onComplete={() => {
                            setShowAddWaypoint(false);
                            setEditingWaypoint(null);
                          }}
                        />
                        <Button
                          onClick={handleEditCancel}
                          className="w-full mt-2"
                          variant="ghost"
                        >
                          Avbryt
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <WaypointsList
                    huntId={activeHunt.id}
                    onEdit={handleEditWaypoint}
                  />
                </>
              ) : (
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
                  <h3 className="text-lg font-medium text-yellow-800 mb-2">Ingen aktiv påskejakt</h3>
                  <p className="text-yellow-700 mb-4">Du må opprette eller velge en påskejakt først.</p>
                  <Button
                    onClick={() => document.querySelector('[value="hunts"]')?.dispatchEvent(new Event('click'))}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Gå til Påskejakter
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="photos" className="p-6 space-y-4">
              <PhotoApproval />
            </TabsContent>
            
            <TabsContent value="tracking" className="p-6 space-y-4">
              <LiveMap />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Admin;
