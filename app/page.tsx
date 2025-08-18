
import { getMoonPhaseWithTiming, MoonPhaseRecommendations } from '@/lib/MoonPhaseCalculator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { formatDateTime } from "@/lib/utils";



// Big moon phase component using moon-pattern.png
function MoonPhaseDisplay({ phase }: { phase: number }) {
  // Use viewBox units instead of pixels for better scaling
  const viewBoxSize = 100;
  const radius = viewBoxSize / 2;
  
  const calculatePath = (phase: number) => {
    if (phase === 0 || phase === 1) {
      // New moon or start of cycle - full circle
      return `M ${radius} 0 A ${radius} ${radius} 0 1 1 ${radius} ${viewBoxSize} A ${radius} ${radius} 0 1 1 ${radius} 0`;
    } else if (phase === 0.5) {
      // Full moon - no dark overlay
      return '';
    } else if (phase < 0.5) {
      // Waxing phases
      const offset = Math.cos(phase * 2 * Math.PI) * radius;
      return `M ${radius} 0 A ${radius} ${radius} 0 1 0 ${radius} ${viewBoxSize} A ${Math.abs(offset)} ${radius} 0 1 ${offset > 0 ? 1 : 0} ${radius} 0`;
    } else {
      // Waning phases
      const offset = Math.cos(phase * 2 * Math.PI) * radius;
      return `M ${radius} 0 A ${Math.abs(offset)} ${radius} 0 1 ${offset > 0 ? 0 : 1} ${radius} ${viewBoxSize} A ${radius} ${radius} 0 1 0 ${radius} 0`;
    }
  };
  
  return (
    <div className="relative w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] aspect-square mx-auto">
      {/* Outer glow effect */}
      <div className="absolute -inset-[10%] rounded-full bg-gradient-to-r from-blue-200/20 via-white/30 to-blue-200/20 blur-2xl animate-pulse" />
      
      {/* Moon container with border */}
      <div className="relative w-full h-full rounded-full border-2 border-gray-300/30 p-[2%]">
        {/* Moon texture background */}
        <div 
          className="relative w-full h-full rounded-full overflow-hidden"
          style={{
            backgroundImage: 'url(/moon-pattern.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(1.1) contrast(1.2)',
          }}
        >
          {/* Dark overlay for the moon phase */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} 
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0"
          >
            <title>Moon phase visualization</title>
            <defs>
              <mask id={`moonPhaseMask-${phase}`}>
                <rect width={viewBoxSize} height={viewBoxSize} fill="white" />
                {calculatePath(phase) && (
                  <path d={calculatePath(phase)} fill="black" />
                )}
              </mask>
              <filter id={`shadowFilter-${phase}`}>
                <feGaussianBlur in="SourceAlpha" stdDeviation="1"/>
                <feOffset dx="0.5" dy="0.5" result="offsetblur"/>
                <feFlood floodColor="#171717" floodOpacity="0.8"/>
                <feComposite in2="offsetblur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <rect 
              width={viewBoxSize} 
              height={viewBoxSize} 
              fill="rgba(0,0,0,0.85)" 
              mask={`url(#moonPhaseMask-${phase})`} 
              filter={`url(#shadowFilter-${phase})`} 
            />
          </svg>
          
          {/* Inner shadow for depth */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_30px_var(--tw-shadow-color)]" />
        </div>
      </div>
      
      {/* Bottom glow for extra effect */}
      <div className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-3/4 h-[10%] bg-neutral-200/20 blur-xl rounded-full" />
    </div>
  );
}

// Small moon icon component for visualizing phases
function MoonIcon({ phase }: { phase: number }) {
  const size = 80;
  const radius = size / 2;
  
  const calculatePath = (phase: number) => {
    if (phase === 0 || phase === 1) {
      return `M ${radius} 0 A ${radius} ${radius} 0 1 1 ${radius} ${size} A ${radius} ${radius} 0 1 1 ${radius} 0`;
    } else if (phase === 0.5) {
      return '';
    } else if (phase < 0.5) {
      const offset = Math.cos(phase * 2 * Math.PI) * radius;
      return `M ${radius} 0 A ${radius} ${radius} 0 1 0 ${radius} ${size} A ${Math.abs(offset)} ${radius} 0 1 ${offset > 0 ? 1 : 0} ${radius} 0`;
    } else {
      const offset = Math.cos(phase * 2 * Math.PI) * radius;
      return `M ${radius} 0 A ${Math.abs(offset)} ${radius} 0 1 ${offset > 0 ? 0 : 1} ${radius} ${size} A ${radius} ${radius} 0 1 0 ${radius} 0`;
    }
  };
  
  return (
    <svg width={size} height={size} className="drop-shadow-md">
      <title>Moon phase icon</title>
      <circle cx={radius} cy={radius} r={radius - 2} fill="#e5e7eb" />
      {calculatePath(phase) && (
        <path d={calculatePath(phase)} fill="#6b7280" opacity="0.95" />
      )}
    </svg>
  );
}

// Moon phase card component
function MoonPhaseCard({ 
  title, 
  phase, 
  phaseValue,
  description, 
  emoji,
  dateText,
  action
}: {
  title: string;
  phase: string;
  phaseValue: number;
  description: string;
  emoji: string;
  dateText?: string;
  action?: string;
}) {
  return (
    <div className=" border-neutral-200 p-6 h-full">
      <div className="flex flex-col items-center text-center space-y-4">
        <MoonIcon phase={phaseValue} />
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-gray-900">
            {title}: {phase} <span className="text-2xl">{emoji}</span>
          </h3>
          {action && (
            <p className="text-sm font-medium text-gray-700">
              {action}
            </p>
          )}
          <p className="text-sm text-gray-600 italic">
            {description}
          </p>
          {dateText && (
            <p className="text-xs text-gray-500 mt-2">{dateText}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MoonHairDashboard() {
  // Get moon phase timing information
  const moonPhaseData = getMoonPhaseWithTiming(new Date());
  
  // Get all moon phases with their recommendations
  const allPhases = [
    { name: 'New Moon', emoji: '🌑', phaseValue: 0 },
    { name: 'Waxing Crescent', emoji: '🌒', phaseValue: 0.125 },
    { name: 'First Quarter', emoji: '🌓', phaseValue: 0.25 },
    { name: 'Waxing Gibbous', emoji: '🌔', phaseValue: 0.375 },
    { name: 'Full Moon', emoji: '🌕', phaseValue: 0.5 },
    { name: 'Waning Gibbous', emoji: '🌖', phaseValue: 0.625 },
    { name: 'Last Quarter', emoji: '🌗', phaseValue: 0.75 },
    { name: 'Waning Crescent', emoji: '🌘', phaseValue: 0.875 }
  ].map(phase => ({
    ...phase,
    recommendations: MoonPhaseRecommendations[phase.name as keyof typeof MoonPhaseRecommendations]
  }));



  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-4">  
      <div className="lg:flex lg:flex-row-reverse lg:items-center lg:gap-12">
          <div className="mb-8 lg:mb-0 lg:flex-1">
            <MoonPhaseDisplay phase={moonPhaseData.current.phaseNumber / 8} />
          </div>
          <div className="lg:flex-1 lg:flex lg:flex-col lg:gap-15">
            <div className="w-md inline-flex flex-col justify-start items-start gap-8 pb-16 md:pb-0 md:pt-16">
              <h1 className="self-stretch justify-start text-3xl font-bold font-sans md:text-5xl">Moon Hair Dashboard</h1>
              <h2 className="self-stretch justify-start text-base font-normal font-mono text-balance">Intrinsic Knowledge from my favourite X Account.<br/><span className="italic">Cut your Hair according to the moon.</span> Make sure to pass the knowledge on and share it with your friends.</h2>
            </div>
            <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-bold font-sans pb-4 md:pb-8">Current Phase: {moonPhaseData.current.name} </h3>
            <div className="flex flex-row gap-4">
              <div className='text-5xl md:text-6xl'>
                {moonPhaseData.current.emoji}
              </div>
              <div className="flex flex-col text-sm justify-center gap-2">
                  <p className="italic font-bold max-w-md text-balance">
                  {MoonPhaseRecommendations[moonPhaseData.current.name as keyof typeof MoonPhaseRecommendations]?.description}
                  </p>
                  <span>Since: {formatDateTime(moonPhaseData.current.startDate)}</span>
                  <span>Until: {formatDateTime(moonPhaseData.current.endDate)}</span>
              </div>
            </div>
            
                    </div>
          </div>
      </div>

        

        {/* Horizontal scrollable moon phases section */}
        <div className="mt-12 mb-8">
          <h2 className="text-2xl font-bold font-sans mb-6">Moon Phases</h2>
          
          {/* Desktop horizontal carousel */}
          <div className="hidden md:block relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full carousel-smooth-scroll"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {/* Previous Phase */}
                <CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/3 lg:basis-1/4">
                  <MoonPhaseCard
                    title="Previous"
                    phase={moonPhaseData.previous.name}
                    phaseValue={moonPhaseData.previous.phaseNumber / 8}
                    emoji={moonPhaseData.previous.emoji}
                    description={moonPhaseData.previous.advice}
                    dateText={`Aug 15`}
                    action={MoonPhaseRecommendations[moonPhaseData.previous.name as keyof typeof MoonPhaseRecommendations]?.action}
                  />
                </CarouselItem>

                <hr className="my-4 rotate-90" />

                {/* Current Phase - Highlighted */}
                <CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/3 lg:basis-1/4">
                  <div className="ring-2 ring-yellow-500">
                    <MoonPhaseCard
                      title="Current"
                      phase={moonPhaseData.current.name}
                      phaseValue={moonPhaseData.current.phaseNumber / 8}
                      emoji={moonPhaseData.current.emoji}
                      description={moonPhaseData.current.advice}
                      dateText={`Since: ${formatDateTime(moonPhaseData.current.startDate)}`}
                      action={MoonPhaseRecommendations[moonPhaseData.current.name as keyof typeof MoonPhaseRecommendations]?.action}
                    />
                  </div>
                </CarouselItem>

                {/* Next Phase */}
                <CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/3 lg:basis-1/4">
                  <MoonPhaseCard
                    title="Next"
                    phase={moonPhaseData.next.name}
                    phaseValue={moonPhaseData.next.phaseNumber / 8}
                    emoji={moonPhaseData.next.emoji}
                    description={moonPhaseData.next.advice}
                    dateText={`Aug 28 - Aug 30`}
                    action={MoonPhaseRecommendations[moonPhaseData.next.name as keyof typeof MoonPhaseRecommendations]?.action}
                  />
                </CarouselItem>

                {/* Upcoming Phases */}
                <CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/3 lg:basis-1/4">
                  <MoonPhaseCard
                    title="Upcoming"
                    phase="Third Quarter"
                    phaseValue={0.75}
                    emoji="🌗"
                    description="Focused on volumizing and enhancing shine"
                    action={MoonPhaseRecommendations["Last Quarter"]?.action}
                  />
                </CarouselItem>

                {/* Additional moon phases */}
                {allPhases.map((phase) => (
                  <CarouselItem key={phase.name} className="pl-2 md:pl-4 basis-full md:basis-1/3 lg:basis-1/4">
                    <MoonPhaseCard
                      title="Phase"
                      phase={phase.name}
                      phaseValue={phase.phaseValue}
                      emoji={phase.emoji}
                      description={phase.recommendations?.description || ''}
                      action={phase.recommendations?.action}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4 bg-white/80 hover:bg-white shadow-lg" />
              <CarouselNext className="hidden md:flex -right-4 bg-white/80 hover:bg-white shadow-lg" />
            </Carousel>
          </div>

          {/* Mobile vertical list */}
          <div className="md:hidden space-y-4">
            {/* Previous Phase */}
            <MoonPhaseCard
              title="Previous"
              phase={moonPhaseData.previous.name}
              phaseValue={moonPhaseData.previous.phaseNumber / 8}
              emoji={moonPhaseData.previous.emoji}
              description={moonPhaseData.previous.advice}
              dateText={`Aug 15`}
              action={MoonPhaseRecommendations[moonPhaseData.previous.name as keyof typeof MoonPhaseRecommendations]?.action}
            />

            {/* Current Phase - Highlighted */}
            <div className="ring-2 ring-yellow-500 rounded-lg">
              <MoonPhaseCard
                title="Current"
                phase={moonPhaseData.current.name}
                phaseValue={moonPhaseData.current.phaseNumber / 8}
                emoji={moonPhaseData.current.emoji}
                description={moonPhaseData.current.advice}
                dateText={`Since: ${formatDateTime(moonPhaseData.current.startDate)}`}
                action={MoonPhaseRecommendations[moonPhaseData.current.name as keyof typeof MoonPhaseRecommendations]?.action}
              />
            </div>

            {/* Next Phase */}
            <MoonPhaseCard
              title="Next"
              phase={moonPhaseData.next.name}
              phaseValue={moonPhaseData.next.phaseNumber / 8}
              emoji={moonPhaseData.next.emoji}
              description={moonPhaseData.next.advice}
              dateText={`Aug 28 - Aug 30`}
              action={MoonPhaseRecommendations[moonPhaseData.next.name as keyof typeof MoonPhaseRecommendations]?.action}
            />

            {/* Upcoming Phase */}
            <MoonPhaseCard
              title="Upcoming"
              phase="Third Quarter"
              phaseValue={0.75}
              emoji="🌗"
              description="Focused on volumizing and enhancing shine"
              action={MoonPhaseRecommendations["Last Quarter"]?.action}
            />
          </div>
        </div>

      </div>
    </div>
  );
}