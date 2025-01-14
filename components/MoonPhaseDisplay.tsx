import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoonPhaseIcon } from "./MoonPhaseIcon"

interface MoonPhaseDisplayProps {
  location: string;
  currentPhase: {
    name: string;
    illumination: number;
    date: string;
  };
  nextPhase: {
    name: string;
    date: string;
  };
}

export default function MoonPhaseDisplay({ location, currentPhase, nextPhase }: MoonPhaseDisplayProps) {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-center">{location}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row justify-around items-center">
        <div className="text-center mb-4 md:mb-0">
          <h2 className="text-xl font-semibold mb-2">Current Phase</h2>
          <MoonPhaseIcon phase={currentPhase.name} size={100} />
          <p className="text-lg font-medium mt-2">{currentPhase.name}</p>
          <p className="text-sm">Illumination: {currentPhase.illumination.toFixed(2)}%</p>
          <p className="text-xs text-gray-500 mt-1">{new Date(currentPhase.date).toLocaleDateString()}</p>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Next Phase</h2>
          <MoonPhaseIcon phase={nextPhase.name} size={100} />
          <p className="text-lg font-medium mt-2">{nextPhase.name}</p>
          <p className="text-xs text-gray-500 mt-1">{new Date(nextPhase.date).toLocaleDateString()}</p>
        </div>
        <pre>
          {JSON.stringify(location, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}

