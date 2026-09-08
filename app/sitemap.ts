import type { MetadataRoute } from "next";

function siteOrigin() {
	const host =
		process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
	if (!host) {
		return "http://localhost:3000";
	}
	return `https://${host.replace(/^https?:\/\//, "")}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
	const origin = siteOrigin();

	return [
		{
			url: origin,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${origin}/full-moon-fasting`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${origin}/developers`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${origin}/privacy`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
	];
}
