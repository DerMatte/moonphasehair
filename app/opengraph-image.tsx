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
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3a 50%, #0f0f23 100%)',
          position: 'relative',
        }}
      >
        {/* Background stars effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(2px 2px at 20px 30px, #ffffff, transparent), radial-gradient(2px 2px at 40px 70px, #ffffff, transparent), radial-gradient(1px 1px at 90px 40px, #ffffff, transparent), radial-gradient(1px 1px at 130px 80px, #ffffff, transparent), radial-gradient(2px 2px at 160px 30px, #ffffff, transparent)',
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 100px',
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
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '60px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Moon emoji */}
          <div
            style={{
              fontSize: '120px',
              marginBottom: '20px',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
            }}
          >
            {currentPhase.emoji}
          </div>
          
          {/* Moon phase name */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '16px',
              textAlign: 'center',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            {currentPhase.name}
          </div>
          
          {/* Action/description */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: '500',
              color: '#e0e7ff',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
              marginBottom: '12px',
            }}
          >
            {currentPhase.action}
          </div>
          
          {/* Secondary description */}
          <div
            style={{
              fontSize: '22px',
              fontWeight: '400',
              color: '#cbd5e1',
              textAlign: 'center',
              maxWidth: '700px',
              lineHeight: 1.3,
            }}
          >
            {currentPhase.description}
          </div>
        </div>
        
        {/* Bottom text */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '18px',
            color: '#94a3b8',
            fontWeight: '400',
          }}
        >
          Moon Phase Hair Care • Current Phase
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}