"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
			/iPad|iPhone|iPod/.test(navigator.userAgent) &&
				!(window as unknown as { MSStream?: unknown }).MSStream,
		);

		setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
	}, []);

	useEffect(() => {
		const ready = (e: BeforeInstallPromptEvent) => {
			e.preventDefault();
			setPromptInstall(e);
		};

		window.addEventListener("beforeinstallprompt", ready as EventListener);

		return () => {
			window.removeEventListener("beforeinstallprompt", ready as EventListener);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!promptInstall) {
			return;
		}
		await promptInstall.prompt();
		setPromptInstall(null);
	};

	if (isStandalone) {
		return null; // Don't show install prompt if already installed
	}

	if (isIOS && !isIOSPromptClosed) {
		return (
			<div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-lg border bg-background p-4 shadow-lg sm:left-auto sm:right-4 sm:max-w-sm">
				<p className="text-sm">
					To install this app on your iOS device, tap the share button and add
					it to your Home Screen.
				</p>
				<Button
					variant="ghost"
					size="icon"
					className="shrink-0"
					onClick={handleCloseIOSPrompt}
					aria-label="Dismiss"
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
		);
	}

	if (promptInstall) {
		return (
			<div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-4 rounded-lg border bg-background p-4 shadow-lg sm:left-auto sm:right-4 sm:max-w-sm">
				<p className="text-sm">Install this app for quick access.</p>
				<Button size="sm" className="shrink-0" onClick={handleInstallClick}>
					Install
				</Button>
			</div>
		);
	}

	return null;
}
