import { Suspense } from "react";
import BigMoon from "@/components/BigMoon";
import MoonCarousel from "@/components/MoonCarousel";
import {
	BigMoonSkeleton,
	CurrentPhaseSkeleton,
	MoonCarouselSkeleton,
} from "@/components/skeletons/page-skeletons";
import { getCurrentMoonPhaseData } from "@/lib/get-current-moon-data";
import { formatDateTime } from "@/lib/utils";

export default function MoonHairDashboard() {
	return (
		<div className="">
			<div className="max-w-screen sm:max-w-7xl mx-auto p-4">
				<div className="lg:flex lg:flex-row-reverse lg:items-center lg:gap-12">
					<div className="mb-8 lg:mb-0 lg:flex-1">
						<Suspense fallback={<BigMoonSkeleton />}>
							<CurrentBigMoon />
						</Suspense>
					</div>
					<div className="lg:flex-1 lg:flex lg:flex-col lg:gap-15">
						{/* Static copy paints immediately — no connection() wait */}
						<div className="w-full max-w-md inline-flex flex-col justify-start items-start gap-8 pb-16 md:pb-0 md:pt-16">
							<h1 className="self-stretch justify-start text-3xl font-bold font-sans md:text-5xl">
								Cut your Hair according to the phase of the moon
							</h1>
							<h2 className="self-stretch justify-start text-base font-normal font-mono text-balance max-w-[80dvw]">
								Intrinsic Knowledge from my favourite X Account visualised as an
								interactive app.
								<br />
								Make sure to pass the knowledge on and share it with your
								friends.
							</h2>
						</div>
						<Suspense fallback={<CurrentPhaseSkeleton />}>
							<CurrentPhaseInfo />
						</Suspense>
					</div>
				</div>

				<Suspense fallback={<MoonCarouselSkeleton />}>
					<CurrentMoonCarousel />
				</Suspense>
			</div>
		</div>
	);
}

async function CurrentBigMoon() {
	const moonPhaseData = await getCurrentMoonPhaseData();
	return <BigMoon phase={moonPhaseData.current.lunarAgePercent} />;
}

async function CurrentPhaseInfo() {
	const moonPhaseData = await getCurrentMoonPhaseData();

	return (
		<div className="flex flex-col gap-4">
			<h3 className="text-2xl font-bold font-sans pb-4 md:pb-8">
				Current Phase: {moonPhaseData.current.name}{" "}
			</h3>
			<div className="flex flex-row gap-4">
				<div className="text-5xl md:text-6xl">{moonPhaseData.current.icon}</div>
				<div className="flex flex-col text-sm justify-center gap-2">
					<p className="italic font-bold max-w-md text-balance">
						{moonPhaseData.current.description}
					</p>
					<span>Since: {formatDateTime(moonPhaseData.current.startDate)}</span>
					<span>Until: {formatDateTime(moonPhaseData.current.endDate)}</span>
				</div>
			</div>
		</div>
	);
}

async function CurrentMoonCarousel() {
	const moonPhaseData = await getCurrentMoonPhaseData();
	return <MoonCarousel moonPhaseData={moonPhaseData} />;
}
