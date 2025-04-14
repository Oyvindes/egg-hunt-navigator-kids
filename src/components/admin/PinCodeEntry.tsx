
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
    <div className="flex flex-col items-center justify-center space-y-6 p-6 bg-white rounded-xl shadow-2xl transform hover:scale-[1.01] transition-transform duration-300 ease-in-out">
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
                  className={`w-12 h-14 text-lg rounded-lg shadow-md transform transition-transform duration-100 active:scale-95 active:shadow-inner
                    ${error ? 'border-red-500 focus:border-red-500' : 'focus:shadow-lg focus:border-purple-500 border-gray-300'}`}
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
        className="w-full max-w-xs bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-lg shadow-md
          transform transition-transform hover:translate-y-[-2px] hover:shadow-xl active:translate-y-[1px] active:shadow-inner"
      >
        Bekreft
      </Button>
    </div>
  );
};

export default PinCodeEntry;
