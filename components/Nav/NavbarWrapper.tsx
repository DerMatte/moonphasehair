"use client";

import { Navbar } from "./Navbar";
import type { LocationData } from "./index";
import type { User } from "@supabase/supabase-js";

interface NavbarWrapperProps {
	locationData: LocationData | null;
	initialUser: User | null;
}

export function NavbarWrapper({
	locationData,
	initialUser,
}: NavbarWrapperProps) {
	return <Navbar locationData={locationData} initialUser={initialUser} />;
}
