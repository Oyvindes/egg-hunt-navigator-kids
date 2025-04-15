import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Shield, MapPin } from 'lucide-react';

interface PrivacyConsentProps {
  onConsent: () => void;
  onDecline?: () => void;
}

const PrivacyConsent: React.FC<PrivacyConsentProps> = ({ onConsent, onDecline }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Samtykke til bruk av posisjon</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-700">
            Denne påskejakten bruker din posisjon for å:
          </p>
          
          <ul className="space-y-2 text-gray-700 list-disc pl-5">
            <li>Vise deg avstanden til neste påskeegg</li>
            <li>Gi deg retningsveiledning via et kompass</li>
            <li>Vise din plassering på et kart for arrangøren</li>
          </ul>
          
          {showDetails && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2 text-sm">
              <p className="font-medium text-gray-700 mb-2">Detaljer om datadeling:</p>
              <ul className="space-y-1 text-gray-600 list-disc pl-5">
                <li>Din nøyaktige posisjon deles med arrangøren</li>
                <li>Et tilfeldig navn brukes for å identifisere deg på kartet</li>
                <li>Posisjonsdata lagres kun under påskejakten</li>
                <li>Data slettes automatisk etter 24 timer</li>
                <li>Ingen tredjeparter får tilgang til din posisjon</li>
              </ul>
            </div>
          )}
          
          <div className="flex items-center">
            <Button 
              variant="link" 
              className="p-0 h-auto text-sm text-blue-500" 
              onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? "Vis mindre" : "Vis flere detaljer"}
            </Button>
          </div>
          
          <div className="flex items-center justify-start pt-2">
            <MapPin className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-gray-600">
              Du kan når som helst trekke tilbake samtykket ved å lukke nettleseren.
            </p>
          </div>
          
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onDecline}
            >
              Ikke godta
            </Button>
            
            <Button
              className="flex-1 bg-primary"
              onClick={() => {
                // Store consent in localStorage
                localStorage.setItem('locationSharingConsent', 'true');
                onConsent();
              }}
            >
              Godta deling
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyConsent;