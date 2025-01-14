import { getMoonPhase } from "../lib/MoonPhaseCalculator";

export const revalidate = 60;

// enum Hemisphere {
//   NORTHERN = "Northern",
//   SOUTHERN = "Southern",
// }

export default async function MoonPhase() {
  const today = new Date();
  const currentPhase = getMoonPhase(today);

  // Calculate next phase
  const nextPhaseDate = new Date(today);
  let nextPhase;
  do {
    nextPhaseDate.setDate(nextPhaseDate.getDate() + 1);
    nextPhase = getMoonPhase(nextPhaseDate);
  } while (nextPhase === currentPhase);

  let previousPhase = currentPhase - 1;
  if (previousPhase < 0) {
    previousPhase = 7;
  }

//   if (hemisphere === Hemisphere.SOUTHERN) {
//     previousPhase = (previousPhase + 4) % 8;
//   } 

  return (
    <div className="flex flex-col sm:flex-row gap-12 items-center">
      <div className="text-center">
        <div className="text-6xl mb-4">{interpretMoonPhase(previousPhase).icon}</div>
        <p className="text-xl font-semibold">Previous: {interpretMoonPhase(previousPhase).phase}</p>
        <p className="text-sm text-gray-600 mt-2">{interpretMoonPhase(previousPhase).effect}</p>
      </div>

      <div className="text-4xl">→</div>

      <div className="text-center">
        <div className="text-6xl mb-4">{interpretMoonPhase(currentPhase).icon}</div>
        <p className="text-xl font-semibold">Current: {interpretMoonPhase(currentPhase).phase}</p>
        <p className="text-sm text-gray-600 mt-2">{interpretMoonPhase(currentPhase).effect}</p>
      </div>
      <div className="text-4xl">→</div>

      <div className="text-center">
        <div className="text-6xl mb-4">{interpretMoonPhase(nextPhase).icon}</div>
        <p className="text-xl font-semibold">Next: {interpretMoonPhase(nextPhase).phase}</p>
        <p className="text-sm text-gray-600 mt-2">{interpretMoonPhase(nextPhase).effect}</p>
      </div>
    </div>
  );
}

function interpretMoonPhase(phase: number): { phase: string; icon: string; effect: string } {
  const phases = [
    { phase: "New Moon", icon: "🌑", effect: "Fresh start / Transformative change" },
    { phase: "Waxing Crescent", icon: "🌒", effect: "Grows back faster / Strengthen" },
    { phase: "First Quarter", icon: "🌓", effect: "New hairstyle / Change colour" },
    { phase: "Waxing Gibbous", icon: "🌔", effect: "Get rid of split ends / Hair care" },
    { phase: "Full Moon", icon: "🌕", effect: "Grows back faster / Nourish" },
    { phase: "Waning Gibbous", icon: "🌖", effect: "Detox / Release stored emotional energy" },
    { phase: "Last Quarter", icon: "🌗", effect: "Slows hair growth" },
    { phase: "Waning Crescent", icon: "🌘", effect: "Leave alone, allow recovery to take place" },
  ];
  return phases[phase];
}