import type { Metadata } from "next";
import Link from "next/link";
import { OriginConfig } from "@/components/developers/origin-config";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { MOON_PHASE_NAMES } from "@/lib/public-moon-api";

export const metadata: Metadata = {
	title: "Developers",
	description:
		"Free public REST API and MCP server for moon phases and hair-cutting guidance.",
};

const endpoints = [
	{
		method: "GET",
		path: "/api/v1",
		detail: "Discovery catalog, MCP URL, and endpoint list",
	},
	{
		method: "GET",
		path: "/api/v1/moon",
		detail: "Current phase, illumination, timing, and hair advice",
		query: "?date=2026-09-08",
	},
	{
		method: "GET",
		path: "/api/v1/phases",
		detail: "All eight phases with traditional hair-cutting guides",
	},
	{
		method: "GET",
		path: "/api/v1/next",
		detail: "Next occurrence of a named phase",
		query: "?phase=Full%20Moon",
	},
	{
		method: "GET",
		path: "/api/v1/fasting",
		detail: "Full-moon fasting window and recommendation",
	},
	{
		method: "GET",
		path: "/api/v1/openapi",
		detail: "OpenAPI 3.1 description of the public API",
	},
] as const;

const mcpTools = [
	{
		name: "get_current_moon_phase",
		detail: "Current phase plus hair-cutting advice",
	},
	{
		name: "get_moon_phase",
		detail: "Snapshot for an optional date",
	},
	{
		name: "list_hair_guides",
		detail: "All eight lunar hair guides",
	},
	{
		name: "get_next_moon_phase",
		detail: "Next occurrence of a named phase",
	},
	{
		name: "get_full_moon_fasting",
		detail: "Next full-moon fasting window",
	},
] as const;

export default function DevelopersPage() {
	return (
		<div className="mx-auto max-w-3xl px-4 py-8">
			<p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
				Free · No API key
			</p>
			<h1 className="mt-3 text-pretty text-center text-4xl font-bold font-sans md:text-5xl">
				API & MCP
			</h1>
			<p className="mx-auto mt-4 max-w-2xl text-pretty text-center text-lg text-muted-foreground">
				Use the same moon-phase timing and hair-cutting guidance as the app.
				CORS is open. Attribution is appreciated, not required.
			</p>

			<div className="mt-10 grid gap-4 sm:grid-cols-2">
				<Card className="bg-neutral-50">
					<CardHeader>
						<CardTitle>REST</CardTitle>
						<CardDescription>
							JSON over HTTPS, cacheable, no auth
						</CardDescription>
					</CardHeader>
					<CardContent className="text-sm text-neutral-700">
						Start at{" "}
						<Link href="/api/v1" className="underline underline-offset-4">
							/api/v1
						</Link>{" "}
						or fetch{" "}
						<Link href="/api/v1/moon" className="underline underline-offset-4">
							/api/v1/moon
						</Link>
						.
					</CardContent>
				</Card>
				<Card className="bg-neutral-50">
					<CardHeader>
						<CardTitle>MCP</CardTitle>
						<CardDescription>
							Streamable HTTP for Cursor, Claude, and other agents
						</CardDescription>
					</CardHeader>
					<CardContent className="text-sm text-neutral-700">
						Connect to{" "}
						<code className="rounded bg-neutral-200 px-1.5 py-0.5">
							/api/mcp
						</code>
						. No OAuth or token required.
					</CardContent>
				</Card>
			</div>

			<section className="mt-14 space-y-6" aria-labelledby="rest-endpoints">
				<h2 id="rest-endpoints" className="text-2xl font-bold font-sans">
					REST endpoints
				</h2>
				<ul className="space-y-3">
					{endpoints.map((endpoint) => (
						<li
							key={endpoint.path}
							className="rounded-xl border border-neutral-200 bg-neutral-50 p-4"
						>
							<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
								<span className="text-xs font-bold tracking-wide text-neutral-500">
									{endpoint.method}
								</span>
								<Link
									href={
										"query" in endpoint
											? `${endpoint.path}${endpoint.query}`
											: endpoint.path
									}
									className="font-mono text-sm underline-offset-4 hover:underline"
								>
									{endpoint.path}
									{"query" in endpoint ? (
										<span className="text-neutral-500">{endpoint.query}</span>
									) : null}
								</Link>
							</div>
							<p className="mt-2 text-sm text-neutral-600">{endpoint.detail}</p>
						</li>
					))}
				</ul>
				<div>
					<p className="mb-2 text-sm font-medium text-neutral-700">Example</p>
					<OriginConfig path="/api/v1/moon" />
				</div>
			</section>

			<section className="mt-14 space-y-4" aria-labelledby="phase-names">
				<h2 id="phase-names" className="text-2xl font-bold font-sans">
					Phase names
				</h2>
				<p className="text-sm text-neutral-600">
					<code className="rounded bg-neutral-200 px-1.5 py-0.5">phase</code>{" "}
					accepts official names or slugs such as{" "}
					<code className="rounded bg-neutral-200 px-1.5 py-0.5">
						full-moon
					</code>
					.
				</p>
				<ul className="flex flex-wrap gap-2">
					{MOON_PHASE_NAMES.map((name) => (
						<li
							key={name}
							className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm"
						>
							{name}
						</li>
					))}
				</ul>
			</section>

			<section className="mt-14 space-y-4" aria-labelledby="mcp">
				<h2 id="mcp" className="text-2xl font-bold font-sans">
					MCP server
				</h2>
				<p className="text-sm text-neutral-600">
					Add this to Cursor{" "}
					<code className="rounded bg-neutral-200 px-1.5 py-0.5">mcp.json</code>
					, Claude, or any MCP client that supports HTTP:
				</p>
				<OriginConfig path="/api/mcp" kind="mcp" />
				<ul className="space-y-2">
					{mcpTools.map((tool) => (
						<li key={tool.name} className="text-sm">
							<code className="rounded bg-neutral-200 px-1.5 py-0.5">
								{tool.name}
							</code>
							<span className="text-neutral-600"> — {tool.detail}</span>
						</li>
					))}
				</ul>
			</section>

			<section className="mt-14 space-y-3" aria-labelledby="machine-docs">
				<h2 id="machine-docs" className="text-2xl font-bold font-sans">
					Machine-readable docs
				</h2>
				<ul className="list-disc space-y-2 pl-6 text-sm text-neutral-700">
					<li>
						<Link href="/llms.txt" className="underline underline-offset-4">
							/llms.txt
						</Link>
					</li>
					<li>
						<Link
							href="/api/v1/openapi"
							className="underline underline-offset-4"
						>
							/api/v1/openapi
						</Link>
					</li>
					<li>
						<Link href="/api/v1" className="underline underline-offset-4">
							/api/v1
						</Link>
					</li>
				</ul>
			</section>
		</div>
	);
}
