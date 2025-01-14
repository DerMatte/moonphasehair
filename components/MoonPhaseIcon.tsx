import { Moon } from 'lucide-react'
import { JSX } from 'react';
interface MoonPhaseIconProps {
  phase: string;
  size?: number;
}

export function MoonPhaseIcon({ phase, size = 24 }: MoonPhaseIconProps) {
  const phases: { [key: string]: JSX.Element } = {
    "New Moon": <Moon size={size} />,
    "Waxing Crescent": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4V20Z" fill="currentColor"/>
      </svg>
    ),
    "First Quarter": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20V4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20Z" fill="currentColor"/>
      </svg>
    ),
    "Waxing Gibbous": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C14.5013 4 16.7793 5.12484 18.2375 6.91508C16.9097 8.91492 16.1579 11.3757 16.1579 14C16.1579 16.6243 16.9097 19.0851 18.2375 21.0849C16.7793 22.8752 14.5013 24 12 24V20Z" fill="currentColor"/>
      </svg>
    ),
    "Full Moon": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="currentColor"/>
      </svg>
    ),
    "Waning Gibbous": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C9.49872 20 7.22067 18.8752 5.76249 17.0849C7.09033 15.0851 7.84211 12.6243 7.84211 10C7.84211 7.37572 7.09033 4.91492 5.76249 2.91508C7.22067 1.12484 9.49872 0 12 0V20Z" fill="currentColor"/>
      </svg>
    ),
    "Last Quarter": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20V4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" fill="currentColor"/>
      </svg>
    ),
    "Waning Crescent": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20V4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20Z" fill="currentColor"/>
      </svg>
    ),
  };

  return phases[phase] || <Moon size={size} />;
}

