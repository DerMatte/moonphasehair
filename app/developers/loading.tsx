export default function DevelopersLoading() {
	return (
		<div className="mx-auto max-w-3xl px-4 py-8" aria-hidden="true">
			<div className="mx-auto h-4 w-40 animate-pulse rounded bg-neutral-200" />
			<div className="mx-auto mt-4 h-12 w-64 animate-pulse rounded bg-neutral-200" />
			<div className="mx-auto mt-4 h-16 max-w-xl animate-pulse rounded bg-neutral-200" />
			<div className="mt-10 grid gap-4 sm:grid-cols-2">
				<div className="h-36 animate-pulse rounded-xl bg-neutral-200" />
				<div className="h-36 animate-pulse rounded-xl bg-neutral-200" />
			</div>
			<div className="mt-14 space-y-3">
				<div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
				<div className="h-20 animate-pulse rounded-xl bg-neutral-200" />
				<div className="h-20 animate-pulse rounded-xl bg-neutral-200" />
				<div className="h-20 animate-pulse rounded-xl bg-neutral-200" />
			</div>
		</div>
	);
}
