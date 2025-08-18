'use client';

import type { FC } from 'react';

interface MoonPhaseIconProps {
  phase: string;
}

const MoonPhaseIcon: FC<MoonPhaseIconProps> = ({ phase }) => {
  const iconStyles = 'w-8 h-8 text-yellow-500';

  // Simple SVG placeholders for moon phases (replace with actual SVGs or images for better visuals)
  const phaseIcons: { [key: string]: string } = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘',
  };

  return (
    <span className={iconStyles} role="img" aria-label={phase}>
      {phaseIcons[phase] || '🌑'}
    </span>
  );
};

export default MoonPhaseIcon;