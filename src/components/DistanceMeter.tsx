
import { formatDistance } from '@/lib/geo-utils';
import { Ruler } from 'lucide-react';

interface DistanceMeterProps {
  distance: number;
}

const DistanceMeter = ({ distance }: DistanceMeterProps) => {
  const formattedDistance = formatDistance(distance);

  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 shadow-2xl text-center border border-gray-600/50 transform hover:scale-[1.01] transition-transform duration-300">
      <h3 className="text-lg font-semibold mb-1 flex items-center justify-center text-black">
        <Ruler className="h-5 w-5 mr-2 text-blue-300" />
        Avstand
      </h3>
      <p className="text-2xl font-bold text-black">{formattedDistance}</p>
    </div>
  );
};

export default DistanceMeter;
