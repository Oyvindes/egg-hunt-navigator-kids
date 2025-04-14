import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadPhoto, createPhotoSubmission } from '@/integrations/supabase/photoService';

interface PhotoSubmitProps {
  waypointId: string;
  huntId: string;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

const PhotoSubmit = ({ waypointId, huntId, onSubmitSuccess, onCancel }: PhotoSubmitProps) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Feil",
        description: "Bildet er for stort (maks 5MB)",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async () => {
    if (!photo) return;
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Upload photo to Supabase Storage
      const photoUrl = await uploadPhoto(photo, huntId, waypointId);
      
      // Step 2: Create submission record in the database
      await createPhotoSubmission(huntId, waypointId, photoUrl);
      
      toast({
        title: "Bilde sendt",
        description: "Bildet er sendt til godkjenning",
      });
      
      onSubmitSuccess();
    } catch (error) {
      console.error('Error submitting photo:', error);
      toast({
        title: "Feil ved innsending",
        description: "Kunne ikke sende bildet. Prøv igjen.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRetake = () => {
    setPhoto(null);
  };
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-3">Ta bilde av påskeegget</h3>
      
      <input 
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      
      {!photo ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary"
          onClick={handleTakePhoto}
        >
          <Camera className="h-16 w-16 text-gray-400 mb-3" />
          <p className="text-sm text-gray-500 text-center">
            Klikk for å åpne kamera eller velge et bilde
          </p>
        </div>
      ) : (
        <div className="mb-4 relative">
          <img 
            src={photo} 
            alt="Captured egg" 
            className="w-full rounded-lg" 
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full"
            onClick={handleRetake}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex space-x-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Avbryt
        </Button>
        
        <Button
          variant="default"
          className="flex-1 bg-primary"
          disabled={!photo || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              Sender...
            </span>
          ) : (
            <span className="flex items-center">
              <Upload className="h-4 w-4 mr-2" /> Send bilde
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PhotoSubmit;