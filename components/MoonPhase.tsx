'use client';

import { getMoonPhase } from "../lib/MoonPhaseCalculator";
import { useHemisphere } from '@/contexts/LocationContext';
import { getMoonEmojiForHemisphere } from '@/lib/hemisphere';

export default function MoonPhase() {
  const hemisphere = useHemisphere();
  const today = new Date();
  const currentPhase = getMoonPhase(today, hemisphere);

  // Calculate next phase
  const nextPhaseDate = new Date(today);
  let nextPhase;
  do {
    nextPhaseDate.setDate(nextPhaseDate.getDate() + 1);
    nextPhase = getMoonPhase(nextPhaseDate, hemisphere);
  } while (nextPhase === currentPhase);

  let previousPhase = currentPhase - 1;
  if (previousPhase < 0) {
    previousPhase = 7;
  }

  //   if (hemisphere === Hemisphere.SOUTHERN) {
  //     previousPhase = (previousPhase + 4) % 8;
  //   }

  function interpretMoonPhase(phase: number): {
    phase: string;
    icon: string;
    effect: string;
  } {
    const phases = [
      {
        phase: "New Moon",
        icon: getMoonEmojiForHemisphere(0, hemisphere),
        effect: "Fresh start / Transformative change",
      },
      {
        phase: "Waxing Crescent",
        icon: getMoonEmojiForHemisphere(1, hemisphere),
        effect: "Hair grows back faster / Strengthen",
      },
      {
        phase: "First Quarter",
        icon: getMoonEmojiForHemisphere(2, hemisphere),
        effect: "New hairstyle / Change colour",
      },
      {
        phase: "Waxing Gibbous",
        icon: getMoonEmojiForHemisphere(3, hemisphere),
        effect: "Get rid of split ends / Hair care",
      },
      {
        phase: "Full Moon",
        icon: getMoonEmojiForHemisphere(4, hemisphere),
        effect: "Hair grows back faster / Nourish",
      },
      {
        phase: "Waning Gibbous",
        icon: getMoonEmojiForHemisphere(5, hemisphere),
        effect: "Detox / Release stored emotional energy",
      },
      {
        phase: "Last Quarter",
        icon: getMoonEmojiForHemisphere(6, hemisphere),
        effect: "Slows hair growth"
      },
      {
        phase: "Waning Crescent",
        icon: getMoonEmojiForHemisphere(7, hemisphere),
        effect: "Leave alone, allow recovery to take place",
      },
    ];
    return phases[phase];
  }

  return (
    <>
      {/* Mobile */}
      <div className="flex flex-col sm:hidden gap-4">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {interpretMoonPhase(currentPhase).icon}
          </div>
          <p className="text-xl font-semibold">
            Current: {interpretMoonPhase(currentPhase).phase}
          </p>
          <p className="text-md text-gray-600 mt-2">
            {interpretMoonPhase(currentPhase).effect}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 pt-24">
          <div className="flex gap-4 items-center justify-center">
            <div className="text-3xl mb-4">
              {interpretMoonPhase(nextPhase).icon}
            </div>
            <div className="flex flex-col">
              <span className="text-md font-semibold">
                Next: {interpretMoonPhase(nextPhase).phase}
              </span>
              <span className="text-md text-gray-600 mt-1">
                {interpretMoonPhase(nextPhase).effect}
              </span>
            </div>
          </div>
          <div className="flex gap-4 items-center justify-center">
            <div className="text-3xl mb-4">
              {interpretMoonPhase(previousPhase).icon}
            </div>
            <div className="flex flex-col">
              <span className="text-md font-semibold">
                Previous: {interpretMoonPhase(previousPhase).phase}
              </span>
              <span className="text-md text-gray-600 mt-1">
                {interpretMoonPhase(previousPhase).effect}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop */}
      <div className="hidden sm:flex sm:flex-row gap-12 items-center">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {interpretMoonPhase(previousPhase).icon}
          </div>
          <p className="text-xl font-semibold">
            Previous: {interpretMoonPhase(previousPhase).phase}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {interpretMoonPhase(previousPhase).effect}
          </p>
        </div>
        <div className="text-4xl">→</div>
        <div className="text-center">
          <div className="text-6xl mb-4">
            {interpretMoonPhase(currentPhase).icon}
          </div>
          <p className="text-xl font-semibold">
            Current: {interpretMoonPhase(currentPhase).phase}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {interpretMoonPhase(currentPhase).effect}
          </p>
        </div>
        <div className="text-4xl">→</div>
        <div className="text-center">
          <div className="text-6xl mb-4">
            {interpretMoonPhase(nextPhase).icon}
          </div>
          <p className="text-xl font-semibold">
            Next: {interpretMoonPhase(nextPhase).phase}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {interpretMoonPhase(nextPhase).effect}
          </p>
        </div>
      </div>
    </>
  );
}
