import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button, buttonVariants } from '@/components/ui/button'
import Yue from '@/public/yue.png'

export const metadata: Metadata = {
	title: "404: Not Found",
	description: "The spirits have hidden this page from you...",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
      <Image src={Yue} alt="Yue from the moon" className="w-1/4" />
      <div className="space-y-4 max-w-md">
        <h2 className="text-2xl font-bold text-neutral-700">
          404: The spirits have hidden this page...
        </h2>
        <p className="text-sm text-neutral-500 italic">
          Even Princess Yue can't illuminate your path in the spirit world.
        </p>
      </div>
      <Link 
        href="/" 
        className={buttonVariants({ variant: "default", className: "items-center gap-2 bg-sky-800 text-neutral-100 px-6 py-3 rounded-lg hover:bg-sky-700 transition-all duration-200 hover:scale-105 group border border-sky-600" })}
      >
        Return to the Physical World
        <span className="group-hover:animate-pulse">🌙</span>
      </Link>
    </div>
  )
}