import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description: "Privacy Policy for Moonphase Hair",
};

export default function PrivacyPage() {
	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			<h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
				Privacy Policy
			</h1>
			<p className="text-center text-muted-foreground mb-16 text-lg max-w-2xl mx-auto">
				Learn how we collect, use, and share your data when you use Moonphase Hair.
			</p>
			
			<h2 className="text-2xl font-bold font-sans pb-4 md:pb-8">
				1. Information We Collect
			</h2>
			<p className="text-neutral-600 mb-4">
				We collect the following information from you:
			</p>
			<ul className="list-disc list-inside text-neutral-600 mb-4">
				<li>Your name</li>
				<li>Your email address</li>
				<li>Your profile picture</li>
			</ul>
			
			<h2 className="text-2xl font-bold font-sans pb-4 md:pb-8">
				2. How We Use Your Information
			</h2>
			<p className="text-neutral-600 mb-4">
				We use your information to:
			</p>
			<ul className="list-disc list-inside text-neutral-600 mb-4">
				<li>Provide you with moon phase and fasting notifications</li>
				<li>Improve our services</li>
				<li>Contact you with important updates</li>
			</ul>
			
		</div>
	);
}