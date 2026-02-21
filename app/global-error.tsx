"use client";

export default function GlobalError({
	error: err,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	console.error("Global error:", err);
	return (
		<html lang="en">
			<body className="bg-neutral-100 p-8 font-sans">
				<div className="mx-auto max-w-md text-center">
					<h1 className="text-2xl font-bold text-neutral-800">
						Something went wrong
					</h1>
					<p className="mt-2 text-neutral-600">
						A critical error occurred. Please try again.
					</p>
					<button
						type="button"
						onClick={reset}
						className="mt-6 rounded-lg bg-neutral-800 px-4 py-2 text-white hover:bg-neutral-700"
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	);
}
