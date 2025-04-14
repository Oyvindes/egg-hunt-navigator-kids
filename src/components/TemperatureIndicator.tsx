
import { getTemperature } from '@/lib/geo-utils';

interface TemperatureIndicatorProps {
  distance: number;
}

const TemperatureIndicator = ({ distance }: TemperatureIndicatorProps) => {
  const temperature = getTemperature(distance);
  
  const getIndicatorClasses = () => {
    switch (temperature) {
      case 'ice':
        return 'bg-blue-200 animate-pulse-ice';
      case 'cold':
        return 'bg-blue-100 animate-pulse-cold';
      case 'warm':
        return 'bg-red-100 animate-pulse-warm';
      case 'hot':
        return 'bg-red-200 animate-pulse-hot';
      default:
        return 'bg-gray-100';
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
    <div className={`rounded-lg p-4 shadow-md text-center ${getIndicatorClasses()}`}>
      <h3 className="text-xl font-bold mb-1">{getTemperatureText()}</h3>
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
