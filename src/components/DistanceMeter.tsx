
import { formatDistance } from '@/lib/geo-utils';
import { Ruler } from 'lucide-react';

interface DistanceMeterProps {
  distance: number;
}

const DistanceMeter = ({ distance }: DistanceMeterProps) => {
  const formattedDistance = formatDistance(distance);

  return (
    <div className="bg-easter-blue rounded-lg p-4 shadow-md text-center border-2 border-secondary">
      <h3 className="text-lg font-semibold mb-1 flex items-center justify-center">
        <Ruler className="h-5 w-5 mr-2 text-secondary" />
        Avstand
      </h3>
      <p className="text-2xl font-bold text-primary">{formattedDistance}</p>
    </div>
  );
};

export default DistanceMeter;
