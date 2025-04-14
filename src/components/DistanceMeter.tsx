
import { formatDistance } from '@/lib/geo-utils';
import { Ruler } from 'lucide-react';

interface DistanceMeterProps {
  distance: number;
}

const DistanceMeter = ({ distance }: DistanceMeterProps) => {
  const formattedDistance = formatDistance(distance);

  return (
    <div className="bg-white rounded-lg p-4 shadow-md text-center border border-gray-200">
      <h3 className="text-lg font-semibold mb-1 flex items-center justify-center">
        <Ruler className="h-5 w-5 mr-2 text-blue-500" />
        Avstand
      </h3>
      <p className="text-2xl font-bold text-primary">{formattedDistance}</p>
    </div>
  );
};

export default DistanceMeter;
