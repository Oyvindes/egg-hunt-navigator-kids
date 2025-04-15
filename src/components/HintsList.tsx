
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
    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-600/50 transform hover:scale-[1.01] transition-transform duration-300">
      <h3 className="text-lg font-semibold mb-3 flex items-center text-black">
        <LightbulbIcon className="h-5 w-5 text-yellow-300 mr-2" />
        <span>Hint ({revealedHints.length}/{hints.length})</span>
      </h3>
      
      {revealedHints.length > 0 ? (
        <ul className="space-y-3">
          {revealedHints.map((hint, index) => (
            <li 
              key={hint.id}
              className={cn(
                "p-3 rounded-lg animate-fade-in border-l-4 backdrop-blur-sm shadow-md",
                index === revealedHints.length - 1
                  ? "bg-yellow-500/20 border-yellow-400/70 text-black"
                  : [
                      "bg-green-500/20 border-green-400/70 text-black",
                      "bg-blue-500/20 border-blue-400/70 text-black",
                      "bg-purple-500/20 border-purple-400/70 text-black"
                    ][index % 3]
              )}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {hint.text}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center p-6 bg-yellow-500/10 backdrop-blur-sm rounded-lg border border-yellow-500/20">
          <p className="text-black">Gå nærmere for å få hint!</p>
        </div>
      )}
    </div>
  );
};

export default HintsList;
