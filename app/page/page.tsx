'use client';

import { useState, useEffect } from 'react';
import SunCalc from 'suncalc';
import MoonPhaseIcon from './MoonPhaseIcon';

const MoonPhase = () => {
  const [moonPhase, setMoonPhase] = useState<string>('');

  useEffect(() => {
    const getMoonPhase = () => {
      const date = new Date();
      const moonIllumination = SunCalc.getMoonIllumination(date);
      const phase = moonIllumination.phase;

      // Determine moon phase based on phase value (0 to 1)
      let phaseName: string;
      if (phase === 0) phaseName = 'New Moon';
      else if (phase < 0.25) phaseName = 'Waxing Crescent';
      else if (phase === 0.25) phaseName = 'First Quarter';
      else if (phase < 0.5) phaseName = 'Waxing Gibbous';
      else if (phase === 0.5) phaseName = 'Full Moon';
      else if (phase < 0.75) phaseName = 'Waning Gibbous';
      else if (phase === 0.75) phaseName = 'Last Quarter';
      else phaseName = 'Waning Crescent';

      setMoonPhase(phaseName);
    };

    getMoonPhase();
  }, []);

  return (
    <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg">
      <MoonPhaseIcon phase={moonPhase} />
      <span className="text-lg font-medium">{moonPhase || 'Loading...'}</span>
    </div>
  );
};

export default MoonPhase;