import { Suspense } from 'react'
import { getMoonPhaseWithTiming, getNextMoonPhaseOccurrence } from '@/lib/MoonPhaseCalculator'
import FastingClient from './fasting-client'

export default function FastingPage() {
  // Get current moon phase data and next full moon
  const moonData = getMoonPhaseWithTiming(new Date())
  
  // Find next full moon
  let nextFullMoon: Date | null = null
  if (moonData.current.name === 'Full Moon') {
    // If we're currently in full moon, use the peak (middle of phase)
    const phaseStart = moonData.current.startDate
    const phaseEnd = moonData.current.endDate
    const phaseDuration = phaseEnd.getTime() - phaseStart.getTime()
    nextFullMoon = new Date(phaseStart.getTime() + phaseDuration / 2)
  } else {
    // Find next full moon occurrence
    nextFullMoon = getNextMoonPhaseOccurrence('Full Moon', new Date())
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-2">Full Moon Fasting</h1>
          <p className="text-center text-muted-foreground mb-8">
            Align your fasting practice with the lunar cycle for optimal results
          </p>
          
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          }>
            <FastingClient 
              currentPhase={moonData.current.name}
              nextFullMoon={nextFullMoon?.toISOString() || null}
            />
          </Suspense>
        </div>
      </div>
    </main>
  )
}