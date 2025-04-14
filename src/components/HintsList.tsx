
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
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <LightbulbIcon className="h-5 w-5 text-yellow-400 mr-2" />
        <span>Hint ({revealedHints.length}/{hints.length})</span>
      </h3>
      
      {revealedHints.length > 0 ? (
        <ul className="space-y-3">
          {revealedHints.map((hint, index) => (
            <li 
              key={hint.id}
              className={cn(
                "p-3 rounded-md animate-fade-in border-l-4",
                index === revealedHints.length - 1 
                  ? "bg-yellow-50 border-yellow-400" 
                  : ["bg-green-50 border-green-400", "bg-blue-50 border-blue-400", "bg-purple-50 border-purple-400"][index % 3]
              )}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {hint.text}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center p-6">
          <p className="text-gray-500">Gå nærmere for å få hint!</p>
        </div>
      )}
    </div>
  );
};

export default HintsList;
