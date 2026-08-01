import { Brain, Calendar, Clock, Heart, Moon, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import BigMoon from "@/components/BigMoon";
import { BigMoonSkeleton } from "@/components/skeletons/page-skeletons";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getCurrentMoonPhaseData,
	getNextFullMoonDate,
} from "@/lib/get-current-moon-data";
import { formatDateTime } from "@/lib/utils";
import FastingClient from "./fasting-client";
import FastingQuickTips from "./fasting-quick-tips";

export const metadata: Metadata = {
	title: "Full Moon Fasting",
	description:
		"Align your fasting practice with the lunar cycle for optimal results and get rid of all the nasty parasites.",
	openGraph: {
		title: "Full Moon Fasting",
		description:
			"Align your fasting practice with the lunar cycle for optimal results and get rid of all the nasty parasites.",
		images: ["https://www.[REDACTED]/full-moon-fasting/opengraph-image.png"],
	},
	twitter: {
		card: "summary_large_image",
		title: "Full Moon Fasting",
		description:
			"Align your fasting practice with the lunar cycle for optimal results and get rid of all the nasty parasites.",
		images: ["https://www.[REDACTED]/full-moon-fasting/twitter-image.png"],
	},
};

export default function FastingPage() {
	return (
		<div className="min-h-screen">
			<div className="w-full max-w-7xl mx-auto px-4 py-8">
				{/* Static shell paints immediately */}
				<h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
					Full Moon Fasting
				</h1>
				<p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
					Align your fasting practice with the lunar cycle for optimal results
					and get rid of all the nasty parasites.
				</p>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					<div className="space-y-6">
						<Suspense fallback={<NextFullMoonCardSkeleton />}>
							<NextFullMoonCard />
						</Suspense>

						{/* Static benefits — no data dependency */}
						<Card className="bg-neutral-50">
							<CardHeader>
								<CardTitle>Why Fast During Full Moon?</CardTitle>
								<CardDescription>
									The full moon&apos;s gravitational pull affects our bodies in
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
												The moon&apos;s gravitational peak enhances your
												body&apos;s natural detox processes, making it the ideal
												time for cleansing through fasting.
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
												Align your body&apos;s rhythms with lunar cycles for
												improved sleep, mood regulation, and overall hormonal
												health.
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
												the moon&apos;s influence on human health for millennia.
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="flex items-center justify-center">
						<div className="w-full max-w-md">
							<Suspense fallback={<BigMoonSkeleton />}>
								<CurrentFastingMoon />
							</Suspense>
						</div>
					</div>
				</div>

				<div className="w-full">
					<Suspense fallback={<FastingClientSkeleton />}>
						<FastingClientSection />
					</Suspense>
				</div>
			</div>
		</div>
	);
}

async function NextFullMoonCard() {
	const [moonData, nextFullMoon] = await Promise.all([
		getCurrentMoonPhaseData(),
		getNextFullMoonDate(),
	]);

	return (
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
						{nextFullMoon ? formatDateTime(nextFullMoon) : "Calculating..."}
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
	);
}

async function CurrentFastingMoon() {
	const moonData = await getCurrentMoonPhaseData();
	return <BigMoon phase={moonData.current.lunarAgePercent} />;
}

async function FastingClientSection() {
	const nextFullMoon = await getNextFullMoonDate();

	return (
		<FastingClient
			nextFullMoon={nextFullMoon?.toISOString() || null}
			quickTips={<FastingQuickTips />}
		/>
	);
}

function NextFullMoonCardSkeleton() {
	return (
		<div
			className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 space-y-4"
			aria-hidden="true"
		>
			<div className="flex items-center gap-2">
				<Skeleton className="size-5 bg-neutral-200" />
				<Skeleton className="h-5 w-36 bg-neutral-200" />
			</div>
			<Skeleton className="h-8 w-56 bg-neutral-200" />
			<Skeleton className="h-4 w-64 bg-neutral-200" />
		</div>
	);
}

function FastingClientSkeleton() {
	return (
		<div
			className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-6 space-y-4 min-h-[280px]"
			aria-hidden="true"
		>
			<Skeleton className="h-6 w-48 bg-neutral-200" />
			<Skeleton className="h-4 w-72 bg-neutral-200" />
			<div className="grid gap-3 sm:grid-cols-3 pt-2">
				<Skeleton className="h-10 w-full bg-neutral-200" />
				<Skeleton className="h-10 w-full bg-neutral-200" />
				<Skeleton className="h-10 w-full bg-neutral-200" />
			</div>
			<Skeleton className="h-11 w-40 bg-neutral-200" />
		</div>
	);
}
