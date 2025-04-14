
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
    <div className="bg-white rounded-lg p-4 shadow-md border-2 border-primary/50">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <div className="sparkle">
          <LightbulbIcon className="h-5 w-5 text-yellow-400 mr-2" />
        </div>
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
                  ? "bg-easter-yellow border-yellow-400" 
                  : ["bg-easter-green border-green-400", "bg-easter-blue border-blue-400", "bg-easter-pink border-pink-400"][index % 3]
              )}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {hint.text}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center p-8">
          <img 
            src="https://emojipedia-us.s3.amazonaws.com/source/skype/289/thinking-face_1f914.png" 
            alt="Thinking" 
            className="w-16 h-16 mx-auto mb-3 animate-float"
          />
          <p className="text-gray-500 italic">Gå nærmere for å få hint!</p>
        </div>
      )}
    </div>
  );
};

export default HintsList;
