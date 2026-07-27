import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description: "Privacy Policy for Moonphase Hair",
};

export default function PrivacyPage() {
	return (
		<div className="mx-auto max-w-3xl px-4 py-8">
			<h1 className="text-pretty text-center text-4xl font-bold md:text-5xl">
				Privacy Policy
			</h1>
			<p className="mx-auto mt-4 max-w-2xl text-pretty text-center text-lg text-muted-foreground">
				This page describes the data flows currently implemented in Moonphase
				Hair. It is a product description, not a legal guarantee.
			</p>
			<p className="mt-3 text-center text-sm text-muted-foreground">
				Last updated: July 27, 2026
			</p>

			<div className="mt-12 space-y-10 text-neutral-700">
				<section aria-labelledby="account-data" className="scroll-mt-6">
					<h2 id="account-data" className="text-2xl font-bold font-sans">
						Account Data
					</h2>
					<p className="mt-3">
						If you sign in with Google or X, the app receives account
						information made available by that provider, such as your name,
						email address, and profile picture. Supabase provides authentication
						and stores the account record used by the app.
					</p>
				</section>

				<section aria-labelledby="location-data" className="scroll-mt-6">
					<h2 id="location-data" className="text-2xl font-bold font-sans">
						Approximate Location
					</h2>
					<p className="mt-3">
						Vercel request headers can provide city, country, region, timezone,
						latitude, and longitude. The app uses these values to display an
						approximate location and orient the moon visualization. The
						application code does not write these location values to its
						account, reminder, or fasting database records. Hosting logs may be
						handled separately by the hosting configuration.
					</p>
				</section>

				<section aria-labelledby="reminder-data" className="scroll-mt-6">
					<h2 id="reminder-data" className="text-2xl font-bold font-sans">
						Reminders & Push Notifications
					</h2>
					<p className="mt-3">
						When you enable a reminder, the app stores the browser push endpoint
						and subscription data, the reminder type, the selected moon phase,
						and the next scheduled date. Browser notification permission is
						controlled separately by your browser.
					</p>
				</section>

				<section aria-labelledby="fasting-data" className="scroll-mt-6">
					<h2 id="fasting-data" className="text-2xl font-bold font-sans">
						Fasting Activity
					</h2>
					<p className="mt-3">
						If you start or schedule a fast, the app stores its start and end
						times, duration, active or scheduled status, and the account that
						created it. This supports the timer and scheduled-reminder features.
					</p>
				</section>

				<section aria-labelledby="analytics-data" className="scroll-mt-6">
					<h2 id="analytics-data" className="text-2xl font-bold font-sans">
						Analytics
					</h2>
					<p className="mt-3">
						The app uses Vercel Analytics to understand page usage and product
						interactions. It also records an interaction event when the moon
						phase hair guide is opened. The exact analytics data available
						depends on the deployed Vercel configuration.
					</p>
				</section>

				<section aria-labelledby="data-use" className="scroll-mt-6">
					<h2 id="data-use" className="text-2xl font-bold font-sans">
						How the App Uses Data
					</h2>
					<ul className="mt-3 list-disc space-y-2 pl-6">
						<li>Authenticate your account and display your profile.</li>
						<li>Calculate and display location-aware moon information.</li>
						<li>Schedule the hair and fasting reminders you select.</li>
						<li>Restore active or scheduled fasting state.</li>
						<li>Understand app usage and diagnose product issues.</li>
					</ul>
				</section>

				<section aria-labelledby="providers" className="scroll-mt-6">
					<h2 id="providers" className="text-2xl font-bold font-sans">
						Service Providers
					</h2>
					<p className="mt-3">
						The current app relies on Vercel for hosting and analytics, Supabase
						for authentication and database storage, and Google or X when you
						choose that provider to sign in. Those services process data needed
						to perform their part of the app.
					</p>
				</section>

				<section aria-labelledby="retention-controls" className="scroll-mt-6">
					<h2 id="retention-controls" className="text-2xl font-bold font-sans">
						Retention & Your Controls
					</h2>
					<ul className="mt-3 list-disc space-y-2 pl-6">
						<li>
							You can remove individual hair and fasting reminder topics from
							your Profile.
						</li>
						<li>
							You can change notification permission in your browser settings.
							Removing browser permission does not itself remove saved reminder
							topics.
						</li>
						<li>
							Stopping or cancelling a fast removes its active or scheduled
							fasting record.
						</li>
						<li>You can sign out from the account menu.</li>
						<li>
							The app does not currently provide self-service deletion for the
							full account or other retained records.
						</li>
						<li>
							Automated retention periods for account, fasting, and analytics
							data are not defined in the repository.
						</li>
					</ul>
				</section>
			</div>
		</div>
	);
}
