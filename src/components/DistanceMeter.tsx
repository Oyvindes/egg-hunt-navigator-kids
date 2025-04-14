
import { formatDistance } from '@/lib/geo-utils';

interface DistanceMeterProps {
  distance: number;
}

const DistanceMeter = ({ distance }: DistanceMeterProps) => {
  const formattedDistance = formatDistance(distance);

  return (
    <div className="bg-white rounded-lg p-4 shadow-md text-center">
      <h3 className="text-lg font-semibold mb-1">Avstand</h3>
      <p className="text-2xl font-bold text-primary">{formattedDistance}</p>
    </div>
  );
};

export default DistanceMeter;
