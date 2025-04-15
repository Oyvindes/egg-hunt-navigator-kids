
import { getTemperature } from '@/lib/geo-utils';
import { Thermometer } from 'lucide-react';

interface TemperatureIndicatorProps {
  distance: number;
}

const TemperatureIndicator = ({ distance }: TemperatureIndicatorProps) => {
  const temperature = getTemperature(distance);
  
  const getIndicatorClasses = () => {
    switch (temperature) {
      case 'ice':
        return 'bg-blue-500/30 animate-pulse-ice border border-blue-400/30 text-black';
      case 'cold':
        return 'bg-blue-400/20 animate-pulse-cold border border-blue-300/30 text-black';
      case 'warm':
        return 'bg-red-400/20 animate-pulse-warm border border-red-300/30 text-black';
      case 'hot':
        return 'bg-red-500/30 animate-pulse-hot border border-red-400/30 text-black';
      default:
        return 'bg-gray-500/20 border border-gray-400/30 text-black';
    }
  };
  
  const getTemperatureText = () => {
    switch (temperature) {
      case 'ice':
        return 'Iskaldt';
      case 'cold':
        return 'Kaldt';
      case 'warm':
        return 'Varmt';
      case 'hot':
        return 'Veldig varmt!';
      default:
        return '';
    }
  };

  return (
    <div className={`rounded-xl p-4 shadow-2xl text-center backdrop-blur-sm transform hover:scale-[1.01] transition-transform duration-300 ${getIndicatorClasses()}`}>
      <h3 className="text-xl font-bold mb-1 flex items-center justify-center">
        <Thermometer className="h-5 w-5 mr-2" />
        {getTemperatureText()}
      </h3>
      <p className="text-sm">
        {temperature === 'hot' ? 'Du er veldig nærme!' : 
         temperature === 'warm' ? 'Du nærmer deg!' : 
         temperature === 'cold' ? 'Du er på rett vei' : 
         'Du har et stykke igjen å gå'}
      </p>
    </div>
  );
};

export default TemperatureIndicator;
