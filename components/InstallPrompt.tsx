"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
	readonly platforms: string[];
	readonly userChoice: Promise<{
		outcome: "accepted" | "dismissed";
		platform: string;
	}>;
	prompt(): Promise<void>;
}

export default function InstallPrompt() {
	const [isIOS, setIsIOS] = useState(false);
	const [isStandalone, setIsStandalone] = useState(false);
	const [promptInstall, setPromptInstall] =
		useState<BeforeInstallPromptEvent | null>(null);
	const [isIOSPromptClosed, setIsIOSPromptClosed] = useState(false);

	const handleCloseIOSPrompt = () => {
		setIsIOSPromptClosed(true);
	};

	useEffect(() => {
		setIsIOS(
			/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream,
		);

		setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
	}, []);

	useEffect(() => {
		const ready = (e: BeforeInstallPromptEvent) => {
			e.preventDefault();
			setPromptInstall(e);
		};

		window.addEventListener("beforeinstallprompt", ready as any);

		return () => {
			window.removeEventListener("beforeinstallprompt", ready as any);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!promptInstall) {
			return;
		}
		const result = await promptInstall.prompt();
		toast.success("App installed successfully");
		setPromptInstall(null);
	};

	if (isStandalone) {
		return null; // Don't show install prompt if already installed
	}

	if (isIOS && !isIOSPromptClosed) {
		toast.info(
			"To install this app on your iOS device, tap the share button and add it to your Home Screen",
		);
	}
	return null;
}
