import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Yue from '@/public/yue.png'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <Image src={Yue} alt="Yue from the moon" className="w-1/4" />

      {/* Avatar themed message */}
      <div className="space-y-4 max-w-md">
        <h2 className="text-2xl font-bold text-neutral-700">
          404: The spirits have hidden this page...
        </h2>
        <p className="text-sm text-neutral-500 italic">
          Even Princess Yue can't illuminate your path in the spirit world.
        </p>
      </div>

      {/* Animated return button with Avatar theme */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 bg-sky-800 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-all duration-200 hover:scale-105 group border border-sky-600"
      >
        Return to the Physical World
        <span className="group-hover:animate-pulse">🌙</span>
      </Link>
    </div>
  )
}