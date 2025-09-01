"use client";

import { Navbar } from "./Navbar";
import type { LocationData } from "./index";
import type { User } from "@supabase/supabase-js";

interface NavbarWrapperProps {
  locationData: LocationData | null;
  initialUser: User | null;
}

export function NavbarWrapper({ locationData, initialUser }: NavbarWrapperProps) {
  // The Navbar component will handle its own auth state updates
  // but we pass the initial user from the server
  return <Navbar locationData={locationData} />;
}