import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

import { InfoButton } from "./InfoButton";
import LocationInfo from "./LocationInfo";

import BorderVector from "@/public/BorderVector.svg";

export const metadata: Metadata = {
  title: "Moonphase Hair",
  description: "How the moon phase affects your hair growth and styling.",
};

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});


const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased text-black bg-neutral-100 font-mono`}
      >
        {/* Border Container */}
        <div className="min-h-screen p-2 sm:p-4 md:p-6 lg:p-16">
          <div className="relative w-full h-full min-h-[calc(100vh-1rem)] sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-8rem)]">
            {/* SVG Border Overlay */}
            <div 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`
                  <svg width="100%" height="100%" viewBox="0 0 1322 924" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M1.5 138V1H1320.5V138L1283.5 175V794L1320.5 831V923H1.5V831L38.5 794V175L1.5 138Z" stroke="#111827" stroke-width="2" vector-effect="non-scaling-stroke"/>
                  </svg>
                `)}")`,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
            />
            
            {/* Content Container - positioned within border */}
            <div className="relative h-full flex flex-col" style={{
              padding: 'clamp(1rem, 4vh, 2rem) clamp(1.5rem, 4vw, 3rem) clamp(1.5rem, 6vh, 3rem) clamp(1.5rem, 4vw, 3rem)'
            }}>
              <header className="flex flex-row-reverse items-center justify-between px-4 py-4 sm:py-6">
                <LocationInfo />
              </header>
              
              <main className="flex-1 py-4 sm:py-6 overflow-auto">
                {children}
              </main>
              
              <footer className="flex flex-row items-center justify-between px-4 py-2">
                <span>Homage: <a href="https://x.com/moonhairbot" target="_blank" rel="noopener noreferrer">Moon Hair</a></span>
                <InfoButton />
              </footer>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
