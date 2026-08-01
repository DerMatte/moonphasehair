import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ProfilePageSkeleton() {
	return (
		<div className="min-h-dvh" role="status" aria-label="Loading profile">
			<div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-4 py-8">
				<div className="mb-8 flex flex-col items-center gap-3">
					<Skeleton className="h-9 w-48 bg-neutral-200" />
					<Skeleton className="h-4 w-72 max-w-full bg-neutral-200" />
				</div>

				<Card>
					<CardHeader>
						<Skeleton className="h-6 w-48 bg-neutral-200" />
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Skeleton className="h-3 w-16 bg-neutral-200" />
							<Skeleton className="h-5 w-56 bg-neutral-200" />
						</div>
						<div className="space-y-2">
							<Skeleton className="h-3 w-24 bg-neutral-200" />
							<Skeleton className="h-5 w-40 bg-neutral-200" />
						</div>
					</CardContent>
				</Card>

				<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 space-y-4 min-h-[160px]">
					<Skeleton className="h-6 w-40 bg-neutral-200" />
					<Skeleton className="h-4 w-full bg-neutral-200" />
					<Skeleton className="h-4 w-5/6 bg-neutral-200" />
					<Skeleton className="h-10 w-36 bg-neutral-200" />
				</div>
			</div>
			<span className="sr-only">Loading profile…</span>
		</div>
	);
}
