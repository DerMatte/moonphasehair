import { ImageResponse } from 'next/og'
import { getMoonPhaseWithTiming } from '@/lib/MoonPhaseCalculator'

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

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
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
            backgroundImage: 'radial-gradient(circle at 25px 25px, #e5e5e5 2px, transparent 2px)',
            backgroundSize: '50px 50px',
            opacity: 0.3,
          }}
        />
        
        {/* Main content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff', // white
            border: '2px solid #e5e5e5', // neutral-200
            borderRadius: '32px',
            padding: '80px 60px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            maxWidth: '900px',
          }}
        >
          {/* Date */}
          <div
            style={{
              fontSize: '24px',
              fontWeight: '500',
              color: '#737373', // neutral-500
              marginBottom: '16px',
              textAlign: 'center',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {currentDate}
          </div>
          
          {/* Moon emoji */}
          <div
            style={{
              fontSize: '140px',
              marginBottom: '24px',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
            }}
          >
            {currentPhase.emoji}
          </div>
          
          {/* Moon phase name - bigger heading */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: '800',
              color: '#171717', // neutral-900
              marginBottom: '20px',
              textAlign: 'center',
              letterSpacing: '-0.025em',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {currentPhase.name}
          </div>
          
          {/* Action/description */}
          <div
            style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#404040', // neutral-700
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.3,
              marginBottom: '16px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
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
              maxWidth: '650px',
              lineHeight: 1.4,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            {currentPhase.description}
          </div>
        </div>
        
        {/* Bottom text */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            fontSize: '20px',
            color: '#737373', // neutral-500
            fontWeight: '500',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Moon Phase Hair Care
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}