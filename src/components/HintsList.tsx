
import React from 'react';
import { Hint } from '@/lib/types';
import { LightbulbIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HintsListProps {
  hints: Hint[];
}

const HintsList = ({ hints }: HintsListProps) => {
  const revealedHints = hints.filter(hint => hint.revealed);
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <LightbulbIcon className="h-5 w-5 text-yellow-400 mr-2" />
        Hint ({revealedHints.length}/{hints.length})
      </h3>
      
      {revealedHints.length > 0 ? (
        <ul className="space-y-2">
          {revealedHints.map((hint, index) => (
            <li 
              key={hint.id}
              className={cn(
                "p-3 rounded-md animate-fade-in",
                index === revealedHints.length - 1 ? "bg-easter-yellow" : "bg-easter-green"
              )}
            >
              {hint.text}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">Gå nærmere for å få hint!</p>
      )}
    </div>
  );
};

export default HintsList;
