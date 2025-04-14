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
    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-600/50 transform hover:scale-[1.01] transition-transform duration-300">
      <h3 className="text-lg font-semibold mb-3 text-white">Ta bilde av påskeegget</h3>
      
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
          className="border-2 border-dashed border-gray-400/50 rounded-xl p-8 mb-4 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400/70 transition-colors duration-300 bg-black/30 backdrop-blur-sm"
          onClick={handleTakePhoto}
        >
          <Camera className="h-16 w-16 text-gray-300/90 mb-3" />
          <p className="text-sm text-gray-300 text-center">
            Klikk for å åpne kamera eller velge et bilde
          </p>
        </div>
      ) : (
        <div className="mb-4 relative">
          <img
            src={photo}
            alt="Captured egg"
            className="w-full rounded-xl shadow-lg"
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
          className="flex-1 rounded-full border-gray-400/50 text-gray-200 hover:bg-gray-700/50 hover:text-white transition-colors duration-300"
          onClick={onCancel}
        >
          Avbryt
        </Button>
        
        <Button
          variant="default"
          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white rounded-full transform hover:translate-y-[-2px] transition-all duration-300 shadow-lg"
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