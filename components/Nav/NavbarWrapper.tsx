"use client";

import type { User } from "@supabase/supabase-js";
import type { LocationData } from "./index";
import { Navbar } from "./Navbar";

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
