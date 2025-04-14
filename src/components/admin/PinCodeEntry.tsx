
import React, { useState } from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface PinCodeEntryProps {
  onSuccess: () => void;
}

const PinCodeEntry = ({ onSuccess }: PinCodeEntryProps) => {
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState(false);
  const correctPin = '1234'; // Default PIN code (in a real app, this would be stored securely)
  
  const handlePinSubmit = () => {
    if (pinCode === correctPin) {
      toast.success('PIN-kode godkjent', {
        description: 'Du har tilgang til admin-panelet'
      });
      localStorage.setItem('adminAuthenticated', 'true');
      setError(false);
      onSuccess();
    } else {
      setError(true);
      toast.error('Feil PIN-kode', {
        description: 'Vennligst prøv igjen'
      });
      setPinCode('');
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center text-center">
        <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Admin tilgang</h2>
        <p className="text-gray-600 mt-2">Skriv inn PIN-kode for å få tilgang til admin-panelet</p>
      </div>

      <div className="w-full max-w-xs">
        <InputOTP 
          value={pinCode} 
          onChange={setPinCode} 
          maxLength={4} 
          pattern="^[0-9]+$"
          render={({ slots }) => (
            <InputOTPGroup className="gap-3 justify-center">
              {slots.map((slot, index) => (
                <InputOTPSlot 
                  key={index} 
                  {...slot} 
                  index={index}
                  className={`w-12 h-14 text-lg ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                />
              ))}
            </InputOTPGroup>
          )}
        />
        
        {error && (
          <div className="flex items-center text-red-500 text-sm mt-2 justify-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>Feil PIN-kode. Vennligst prøv igjen.</span>
          </div>
        )}
      </div>
      
      <Button 
        onClick={handlePinSubmit} 
        disabled={pinCode.length !== 4}
        className="w-full max-w-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
      >
        Bekreft
      </Button>
    </div>
  );
};

export default PinCodeEntry;
