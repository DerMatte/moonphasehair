import { Suspense } from "react";
import {
	getMoonPhaseWithTiming,
	getNextMoonPhaseOccurrence,
} from "@/lib/MoonPhaseCalculator";
import { formatDateTime } from "@/lib/utils";
import FastingClient from "./fasting-client";
import BigMoon from "@/components/BigMoon";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Moon, Calendar, Heart, Brain, Sparkles, Clock } from "lucide-react";
import { Metadata } from "next";

export const revalidate = 3600; // 1 hour

export const metadata: Metadata = {
	title: "Full Moon Fasting",
	description:
		"Align your fasting practice with the lunar cycle for optimal results and get rid of all the nasty parasites.",
	openGraph: {
		title: "Full Moon Fasting",
		description:
			"Align your fasting practice with the lunar cycle for optimal results and get rid of all the nasty parasites.",
		images: [
			"https://www.moonphasehair.com/full-moon-fasting/opengraph-image.png",
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Full Moon Fasting",
		description:
			"Align your fasting practice with the lunar cycle for optimal results and get rid of all the nasty parasites.",
		images: [
			"https://www.moonphasehair.com/full-moon-fasting/twitter-image.png",
		],
		// site: "@moonphasehairbot",
		// creator: "@moonphasehairbot",
		// creatorId: "17180874",
		// siteId: "17180874",
	},
};

export default function FastingPage() {
	// Get current moon phase data and next full moon
	const moonData = getMoonPhaseWithTiming(new Date());

	// Find next full moon
	let nextFullMoon: Date | null = null;
	if (moonData.current.name === "Full Moon") {
		// If we're currently in full moon, use the peak (middle of phase)
		const phaseStart = moonData.current.startDate;
		const phaseEnd = moonData.current.endDate;
		const phaseDuration = phaseEnd.getTime() - phaseStart.getTime();
		nextFullMoon = new Date(phaseStart.getTime() + phaseDuration / 2);
	} else {
		// Find next full moon occurrence
		nextFullMoon = getNextMoonPhaseOccurrence("Full Moon", new Date());
	}

	return (
		<main className="min-h-screen">
			<div className="w-full max-w-7xl mx-auto px-4 py-8">
				<h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
					Full Moon Fasting
				</h1>
				<p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
					Align your fasting practice with the lunar cycle for optimal results
					and get rid of all the nasty parasites.
				</p>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					{/* First Column - Fasting Info & Next Full Moon */}
					<div className="space-y-6">
						{/* Next Full Moon Card */}
						<Card className="bg-neutral-50">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Calendar className="w-5 h-5" />
									Next Full Moon
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="text-2xl font-semibold">
										{nextFullMoon
											? formatDateTime(nextFullMoon)
											: "Calculating..."}
									</div>
									{moonData.current.name === "Full Moon" ? (
										<div className="text-sm text-green-600 font-medium flex items-center gap-2">
											<Moon className="w-4 h-4" />
											Currently in Full Moon phase - Perfect time to fast!
										</div>
									) : (
										<div className="text-sm text-muted-foreground">
											Prepare for your next fasting opportunity
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Fasting Benefits Card */}
						<Card className="bg-neutral-50">
							<CardHeader>
								<CardTitle>Why Fast During Full Moon?</CardTitle>
								<CardDescription>
									The full moon's gravitational pull affects our bodies in
									profound ways
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-start gap-3">
										<div className="p-2 bg-primary/10 rounded-lg">
											<Sparkles className="w-5 h-5 text-primary" />
										</div>
										<div>
											<h4 className="font-semibold mb-1">
												Enhanced Detoxification
											</h4>
											<p className="text-sm text-muted-foreground">
												The moon's gravitational peak enhances your body's
												natural detox processes, making it the ideal time for
												cleansing through fasting.
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<div className="p-2 bg-primary/10 rounded-lg">
											<Brain className="w-5 h-5 text-primary" />
										</div>
										<div>
											<h4 className="font-semibold mb-1">Mental Clarity</h4>
											<p className="text-sm text-muted-foreground">
												Experience heightened awareness and spiritual connection
												as your mind becomes clearer during the fast.
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<div className="p-2 bg-primary/10 rounded-lg">
											<Heart className="w-5 h-5 text-primary" />
										</div>
										<div>
											<h4 className="font-semibold mb-1">Hormonal Balance</h4>
											<p className="text-sm text-muted-foreground">
												Align your body's rhythms with lunar cycles for improved
												sleep, mood regulation, and overall hormonal health.
											</p>
										</div>
									</div>

									<div className="flex items-start gap-3">
										<div className="p-2 bg-primary/10 rounded-lg">
											<Clock className="w-5 h-5 text-primary" />
										</div>
										<div>
											<h4 className="font-semibold mb-1">Ancient Wisdom</h4>
											<p className="text-sm text-muted-foreground">
												Connect with ancestral practices that have recognized
												the moon's influence on human health for millennia.
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Second Column - Big Moon */}
					<div className="flex items-center justify-center">
						<div className="w-full max-w-md mb-32 lg:mb-0">
							<BigMoon phase={moonData.current.lunarAgePercent} />
						</div>
					</div>
				</div>

				{/* Bottom Section - Fasting Client spanning full width */}
				<div className="w-full">
					<Suspense
						fallback={
							<div className="flex items-center justify-center min-h-[400px]">
								<div className="animate-pulse text-muted-foreground">
									Loading fasting options...
								</div>
							</div>
						}
					>
						<FastingClient
							currentPhase={moonData.current.name}
							nextFullMoon={nextFullMoon?.toISOString() || null}
						/>
					</Suspense>
				</div>
			</div>
		</main>
	);
}
