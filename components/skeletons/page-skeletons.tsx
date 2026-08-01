import { Skeleton } from "@/components/ui/skeleton";

const carouselCardClassName =
	"min-w-0 md:basis-[calc(50%-0.5rem)] md:shrink-0 lg:basis-[calc(33.333%-0.667rem)]";

function CarouselCardSkeleton() {
	return (
		<div className={carouselCardClassName}>
			<div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-3 min-h-[180px]">
				<Skeleton className="h-4 w-20 bg-neutral-200" />
				<div className="flex items-center gap-3">
					<Skeleton className="size-10 rounded-full bg-neutral-200" />
					<Skeleton className="h-5 w-32 bg-neutral-200" />
				</div>
				<Skeleton className="h-3 w-full bg-neutral-200" />
				<Skeleton className="h-3 w-4/5 bg-neutral-200" />
				<Skeleton className="h-3 w-28 bg-neutral-200" />
			</div>
		</div>
	);
}

function BenefitRowSkeleton() {
	return (
		<div className="flex items-start gap-3">
			<Skeleton className="size-9 rounded-lg shrink-0 bg-neutral-200" />
			<div className="space-y-2 w-full">
				<Skeleton className="h-4 w-40 bg-neutral-200" />
				<Skeleton className="h-3 w-full bg-neutral-200" />
				<Skeleton className="h-3 w-5/6 bg-neutral-200" />
			</div>
		</div>
	);
}

export function BigMoonSkeleton() {
	return (
		<div
			className="relative w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] aspect-square mx-auto"
			aria-hidden="true"
		>
			<div className="absolute -inset-[10%] rounded-full bg-neutral-200/40 blur-2xl" />
			<div className="relative w-full h-full rounded-full border-2 border-neutral-200/60 p-[2%]">
				<Skeleton className="h-full w-full rounded-full bg-neutral-200" />
			</div>
		</div>
	);
}

export function CurrentPhaseSkeleton() {
	return (
		<div className="flex flex-col gap-4" aria-hidden="true">
			<Skeleton className="h-8 w-64 md:h-9 bg-neutral-200" />
			<div className="flex flex-row gap-4">
				<Skeleton className="size-14 md:size-16 shrink-0 rounded-md bg-neutral-200" />
				<div className="flex flex-col gap-2 w-full max-w-md">
					<Skeleton className="h-4 w-full bg-neutral-200" />
					<Skeleton className="h-4 w-5/6 bg-neutral-200" />
					<Skeleton className="h-3 w-40 bg-neutral-200" />
					<Skeleton className="h-3 w-40 bg-neutral-200" />
				</div>
			</div>
		</div>
	);
}

export function MoonCarouselSkeleton() {
	return (
		<section className="mt-12 mb-8" aria-hidden="true">
			<Skeleton className="mb-6 h-8 w-40 bg-neutral-200" />
			<div className="grid gap-4 md:flex md:overflow-hidden md:pb-4">
				<CarouselCardSkeleton />
				<CarouselCardSkeleton />
				<CarouselCardSkeleton />
			</div>
		</section>
	);
}

export function HomePageSkeleton() {
	return (
		<div className="" role="status" aria-label="Loading moon phase dashboard">
			<div className="max-w-screen sm:max-w-7xl mx-auto p-4">
				<div className="lg:flex lg:flex-row-reverse lg:items-center lg:gap-12">
					<div className="mb-8 lg:mb-0 lg:flex-1">
						<BigMoonSkeleton />
					</div>
					<div className="lg:flex-1 lg:flex lg:flex-col lg:gap-15">
						<div className="w-full max-w-md inline-flex flex-col justify-start items-start gap-8 pb-16 md:pb-0 md:pt-16">
							<Skeleton className="h-10 w-full md:h-14 bg-neutral-200" />
							<Skeleton className="h-10 w-4/5 md:h-14 bg-neutral-200" />
							<div className="space-y-2 w-full max-w-[80dvw]">
								<Skeleton className="h-4 w-full bg-neutral-200" />
								<Skeleton className="h-4 w-5/6 bg-neutral-200" />
								<Skeleton className="h-4 w-3/4 bg-neutral-200" />
							</div>
						</div>
						<CurrentPhaseSkeleton />
					</div>
				</div>
				<MoonCarouselSkeleton />
			</div>
			<span className="sr-only">Loading current moon data…</span>
		</div>
	);
}

function FastingCardSkeleton({ lines = 2 }: { lines?: number }) {
	return (
		<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 space-y-4">
			<div className="flex items-center gap-2">
				<Skeleton className="size-5 rounded bg-neutral-200" />
				<Skeleton className="h-5 w-40 bg-neutral-200" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-4 w-full bg-neutral-200" />
				{lines >= 2 ? <Skeleton className="h-4 w-full bg-neutral-200" /> : null}
				{lines >= 3 ? <Skeleton className="h-4 w-2/3 bg-neutral-200" /> : null}
			</div>
		</div>
	);
}

export function FastingPageSkeleton() {
	return (
		<div
			className="min-h-screen"
			role="status"
			aria-label="Loading full moon fasting page"
		>
			<div className="w-full max-w-7xl mx-auto px-4 py-8">
				<div className="flex flex-col items-center mb-16 gap-4">
					<Skeleton className="h-10 w-72 md:h-12 md:w-96 bg-neutral-200" />
					<Skeleton className="h-5 w-full max-w-xl bg-neutral-200" />
					<Skeleton className="h-5 w-3/4 max-w-lg bg-neutral-200" />
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					<div className="space-y-6">
						<FastingCardSkeleton lines={3} />
						<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 space-y-5">
							<div className="space-y-2">
								<Skeleton className="h-6 w-56 bg-neutral-200" />
								<Skeleton className="h-4 w-72 bg-neutral-200" />
							</div>
							<BenefitRowSkeleton />
							<BenefitRowSkeleton />
							<BenefitRowSkeleton />
							<BenefitRowSkeleton />
						</div>
					</div>

					<div className="flex items-center justify-center">
						<div className="w-full max-w-md">
							<BigMoonSkeleton />
						</div>
					</div>
				</div>

				<div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-6 space-y-4 min-h-[280px]">
					<Skeleton className="h-6 w-48 bg-neutral-200" />
					<Skeleton className="h-4 w-72 bg-neutral-200" />
					<div className="grid gap-3 sm:grid-cols-3 pt-2">
						<Skeleton className="h-10 w-full bg-neutral-200" />
						<Skeleton className="h-10 w-full bg-neutral-200" />
						<Skeleton className="h-10 w-full bg-neutral-200" />
					</div>
					<Skeleton className="h-11 w-40 bg-neutral-200" />
				</div>
			</div>
			<span className="sr-only">Loading current fasting window…</span>
		</div>
	);
}
