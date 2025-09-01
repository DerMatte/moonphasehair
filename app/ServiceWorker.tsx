"use client";

import { useEffect } from "react";

export default function ServiceWorker() {
	useEffect(() => {
		if ("serviceWorker" in navigator && "PushManager" in window) {
			navigator.serviceWorker
				.register("/sw.js")
				.then((registration) => console.log("Service Worker registered"))
				.catch((error) =>
					console.error("Service Worker registration failed:", error),
				);
		}
	}, []);

	return null;
}
