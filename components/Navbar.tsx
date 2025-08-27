import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";
import logo from "@/public/moonphasehair-logo.png";

export function Navbar() {
  return (
    <nav className="w-full">
      <div className="flex items-center">
        <Link href="/" className="flex items-center mr-4">
          <Image
            src={logo}
            alt="Moonphase Hair Logo"
            className="size-14"
            priority
          />
        </Link>
        <div className="flex text-mono">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "ghost" }), "px-3 py-1 rounded bg-transparent hover:bg-neutral-300 transition-colors text-sm font-medium")}
          >
            Home
          </Link>
          <Link
            href="/full-moon-fasting"
            className={cn(buttonVariants({ variant: "ghost" }), "px-3 py-1 rounded bg-transparent hover:bg-neutral-300 transition-colors text-sm font-medium")}
          >
            Full Moon Fasting
          </Link>
        </div>
      </div>
    </nav>
  );
}
