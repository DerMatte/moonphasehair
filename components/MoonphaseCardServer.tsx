import MoonIcon from "@/components/MoonIcon";
import { 
  getNextMoonPhaseOccurrence, 
  getTimeUntilDate, 
  getMoonPhaseWithTiming 
} from "@/lib/MoonPhaseCalculator";
import { getSubscriptionStatus } from "@/app/actions/moon-subscription";
import { MoonPhaseCardClient } from "./MoonphaseCardOptimized";

// Server Component
export default async function MoonPhaseCardServer({
  title,
  phase,
  phaseValue,
  description,
  emoji,
  icon,
  dateText,
  action,
}: {
  title: string;
  phase: string;
  phaseValue: number;
  description: string;
  emoji: string;
  icon?: string;
  dateText?: string;
  action?: string;
}) {
  // Calculate the next occurrence of this phase and time until it
  const currentPhaseData = getMoonPhaseWithTiming(new Date());
  const isCurrentPhase = currentPhaseData.current.name === phase;

  let timeUntilPhase: string | null = null;
  
  if (isCurrentPhase) {
    const timeUntilEnd = getTimeUntilDate(currentPhaseData.current.endDate);
    timeUntilPhase = `ends ${timeUntilEnd}`;
  } else {
    const nextDate = getNextMoonPhaseOccurrence(phase);
    timeUntilPhase = nextDate ? getTimeUntilDate(nextDate) : null;
  }

  // Check subscription status on the server
  const isSubscribed = await getSubscriptionStatus(phase);

  return (
    <div className="flex flex-col gap-4 h-full items-start justify-start p-6">
      {/* Moon Icon */}
      <MoonIcon phase={phaseValue} />
      
      {/* Phase Info */}
      <div className="flex flex-col gap-1.5 items-start justify-start w-full">
        <h3 className="font-bold text-base leading-normal">
          {title}: {phase} <span className="font-normal">{icon || emoji}</span>
        </h3>
        {action && (
          <p className="font-mono italic text-base leading-normal">{action}</p>
        )}
        <p className="font-mono italic text-base leading-normal min-h-[42px] ">
          {description}
        </p>
      </div>

      {/* Date Text - Always display if available */}
      {dateText ? (
        <div className="w-full">
          <p className="font-mono text-base leading-normal">{dateText}</p>
        </div>
      ) : null}

      {/* Client Component for subscription button */}
      <MoonPhaseCardClient
        phase={phase}
        timeUntilPhase={timeUntilPhase}
        isCurrentPhase={isCurrentPhase}
        initialSubscribed={isSubscribed}
      />

      {/* Current Phase Status */}
      {timeUntilPhase && isCurrentPhase && (
        <div className="py-2 text-center">
          <p className="font-mono text-base">Current phase {timeUntilPhase}</p>
        </div>
      )}
    </div>
  );
}