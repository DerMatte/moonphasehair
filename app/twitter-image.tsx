import { ImageResponse } from 'next/og'
import { getMoonPhaseWithTiming } from '@/lib/MoonPhaseCalculator'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Image metadata
export const alt = 'Current Moon Phase for Hair Care'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Image generation
export default async function Image() {
  const moonData = getMoonPhaseWithTiming(new Date())
  const currentPhase = moonData.current
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  // Font loading, process.cwd() is Next.js project directory
  const spaceGroteskBold = await readFile(
    join(process.cwd(), '/public/SpaceGrotesk-Bold.ttf')
  )
  const spaceMonoRegular = await readFile(
    join(process.cwd(), '/public/SpaceMono-Regular.ttf')
  ) 
 

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '32px',
          paddingBottom: '32px',
          background: '#f5f5f5', // neutral-100
          position: 'relative',
        }}
      >
        {/* Subtle background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #e5e5e5 2px, transparent 2px)',
            backgroundSize: '50px 50px',
            opacity: 0.3,
          }}
        />
        {/* Date */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: '500',
            color: '#737373', // neutral-500
            marginBottom: '24px',
            textAlign: 'center',
            fontFamily: 'Space Mono, monospace',
          }}
        >
          {currentDate}
        </div>
          
        {/* Moon emoji */}
        <div
          style={{
            fontSize: '192px',
            marginBottom: '0px',
            paddingBottom: '0px',
            lineHeight: '1.2',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
          }}
        >
          {currentPhase.emoji}
        </div>
          
        {/* Moon phase name - bigger heading */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: '800',
            color: '#171717', // neutral-900
            // marginBottom: '24px',
            textAlign: 'center',
            letterSpacing: '-0.025em',
            fontFamily: 'Space Grotesk, sans-serif',
          }}
        >
          {currentPhase.name}
        </div>
          
        {/* Action/description */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: '600',
            color: '#404040', // neutral-700
            textAlign: 'center',
            maxWidth: '1000px',
            lineHeight: 1.2,
            marginBottom: '20px',
            fontFamily: 'Space Mono, monospace',
          }}
        >
          {currentPhase.action}
        </div>
          
        {/* Secondary description */}
        <div
          style={{
            fontSize: '24px',
            fontWeight: '400',
            color: '#525252', // neutral-600
            textAlign: 'center',
            maxWidth: '1000px',
            lineHeight: 1.2,
            fontFamily: 'Space Mono, monospace',
          }}
        >
          {currentPhase.description}
        </div>
        
        {/* Bottom text */}
        <div
          style={{
            // position: 'absolute',
            // bottom: '20px',
            fontSize: '24px',
            color: '#737373', // neutral-500
            fontWeight: '500',
            // align-self: flex-end;
            marginTop: 'auto',
            fontFamily: 'Space Mono, monospace',
          }}
        >
          moonphasehair.com
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
      fonts: [
        {
          name: 'Space Grotesk',
          data: spaceGroteskBold,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Space Mono',
          data: spaceMonoRegular,
          style: 'normal',
          weight: 400,
        },
      ],
      headers: {
        'Cache-Control': 'public, max-age=10800, s-maxage=10800, stale-while-revalidate=10800', // 3 hours
      },
    }
  )
}