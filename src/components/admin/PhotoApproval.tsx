import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Image, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHunt } from '@/contexts/hunt';
import {
  getPendingPhotoSubmissions,
  updateSubmissionStatus,
  type PhotoSubmission
} from '@/integrations/supabase/photoService';
import {
  triggerNotification,
  requestNotificationPermission,
  showPhotoSubmissionNotification
} from '@/lib/notificationUtils';

const PhotoApproval = () => {
  const [submissions, setSubmissions] = useState<PhotoSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const previousSubmissionCount = useRef(0);
  const { toast } = useToast();
  const { hunts, setWaypointFound } = useHunt();
  
  // Request notification permission on component mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  
  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const pendingSubmissions = await getPendingPhotoSubmissions();
      
      // Check if there are new submissions since last check
      if (pendingSubmissions.length > previousSubmissionCount.current && notificationsEnabled) {
        // Show push notification, play sound and vibrate for new submissions
        showPhotoSubmissionNotification();
        
        // Show toast notification
        toast({
          title: "Ny bildeinnlevering",
          description: "En ny forespørsel om bildegodkjenning har kommet inn",
        });
      }
      
      // Store current count for next comparison
      previousSubmissionCount.current = pendingSubmissions.length;
      setSubmissions(pendingSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Feil ved lasting",
        description: "Kunne ikke laste bildeinnsendinger",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadSubmissions();
    
    // Set up polling to refresh submissions every 10 seconds
    const interval = setInterval(loadSubmissions, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const getWaypointInfo = (huntId: string, waypointId: string) => {
    const hunt = hunts.find(h => h.id === huntId);
    if (!hunt) return { huntName: 'Ukjent påskejakt', waypointName: 'Ukjent post' };
    
    const waypoint = hunt.waypoints.find(w => w.id === waypointId);
    if (!waypoint) return { huntName: hunt.name, waypointName: 'Ukjent post' };
    
    return { huntName: hunt.name, waypointName: waypoint.name };
  };
  
  const handleApprove = async (submission: PhotoSubmission) => {
    try {
      // Update submission status in Supabase
      await updateSubmissionStatus(submission.id, 'approved');
      
      // Mark waypoint as found
      await setWaypointFound(submission.huntId, submission.waypointId, true);
      
      // Get waypoint info for the notification
      const waypointInfo = getWaypointInfo(submission.huntId, submission.waypointId);
      
      // Notify with success sound
      triggerNotification(
        "Bilde godkjent",
        {
          body: `${waypointInfo.waypointName} er nå markert som funnet!`,
          icon: '/favicon.ico',
        }
      );
      
      toast({
        title: "Godkjent",
        description: "Bildet ble godkjent og posten markert som funnet",
        variant: "default"
      });
      
      // Remove from current list
      setSubmissions(submissions.filter(sub => sub.id !== submission.id));
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: "Feil ved godkjenning",
        description: "Kunne ikke godkjenne bildet",
        variant: "destructive"
      });
    }
  };
  
  const handleReject = async (submission: PhotoSubmission) => {
    try {
      const waypointInfo = getWaypointInfo(submission.huntId, submission.waypointId);
      
      // Update submission status in Supabase
      await updateSubmissionStatus(submission.id, 'rejected');
      
      // Notify with rejection sound
      triggerNotification(
        "Bilde avvist",
        {
          body: `Bildet for ${waypointInfo.waypointName} ble avvist. Deltaker må ta nytt bilde.`,
          icon: '/favicon.ico',
        }
      );
      
      toast({
        title: "Avvist",
        description: "Bildet ble avvist. Deltaker må ta et nytt bilde.",
        variant: "default"
      });
      
      // Remove from current list
      setSubmissions(submissions.filter(sub => sub.id !== submission.id));
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Feil ved avvisning",
        description: "Kunne ikke avvise bildet",
        variant: "destructive"
      });
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <Image className="mr-2 h-5 w-5 text-primary" />
          Bildeinnleveringer
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className="flex items-center"
            title={notificationsEnabled ? "Deaktiver varsler" : "Aktiver varsler"}
          >
            {notificationsEnabled ? (
              <Volume2 className="h-4 w-4 text-green-500" />
            ) : (
              <VolumeX className="h-4 w-4 text-gray-400" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadSubmissions();
              // Request notification permission again when refreshing
              requestNotificationPermission();
            }}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Oppdater
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-lg p-4 shadow-md text-center text-gray-500">
          Ingen ventende bildeinnleveringer
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(submission => {
            const { huntName, waypointName } = getWaypointInfo(submission.huntId, submission.waypointId);
            const submissionTime = new Date(submission.timestamp).toLocaleString('nb-NO');
            
            return (
              <div key={submission.id} className="bg-white rounded-lg p-4 shadow-md">
                <div className="mb-2">
                  <h3 className="font-medium">{huntName}</h3>
                  <p className="text-sm text-gray-500">Post: {waypointName}</p>
                  <p className="text-xs text-gray-400">Sendt inn: {submissionTime}</p>
                </div>
                
                <div className="rounded-md overflow-hidden mb-3">
                  <img
                    src={submission.photoUrl}
                    alt="Egg submission"
                    className="w-full object-cover"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                    onClick={() => handleReject(submission)}
                  >
                    <X className="h-4 w-4 mr-1" /> Avvis
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex-1 border-green-500 text-green-500 hover:bg-green-50"
                    onClick={() => handleApprove(submission)}
                  >
                    <Check className="h-4 w-4 mr-1" /> Godkjenn
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PhotoApproval;