
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
        return 'bg-blue-200 animate-pulse-ice border-2 border-blue-300';
      case 'cold':
        return 'bg-blue-100 animate-pulse-cold border-2 border-blue-200';
      case 'warm':
        return 'bg-red-100 animate-pulse-warm border-2 border-red-200';
      case 'hot':
        return 'bg-red-200 animate-pulse-hot border-2 border-red-300';
      default:
        return 'bg-gray-100 border-2 border-gray-200';
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

  const getTemperatureEmoji = () => {
    switch (temperature) {
      case 'ice':
        return '❄️';
      case 'cold':
        return '🧊';
      case 'warm':
        return '🔥';
      case 'hot':
        return '🔥🔥';
      default:
        return '';
    }
  };

  return (
    <div className={`rounded-lg p-4 shadow-md text-center ${getIndicatorClasses()}`}>
      <h3 className="text-xl font-bold mb-1 flex items-center justify-center">
        <Thermometer className="h-5 w-5 mr-2" />
        {getTemperatureText()} {getTemperatureEmoji()}
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
