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

export const metadata: Metadata = {
	title: "Developers",
	description:
		"Free public REST API and MCP server for moon phases and hair-cutting guidance.",
};

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
		<div className="mx-auto w-full min-w-0 max-w-3xl px-4 py-8">
			<p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-neutral-500">
				Free · No API key
			</p>
			<h1 className="mt-3 text-pretty text-center text-4xl font-bold font-sans md:text-5xl">
				API & MCP
			</h1>
			<p className="mx-auto mt-4 max-w-2xl text-pretty text-center text-lg text-muted-foreground">
				Two public endpoints. CORS is open. No authentication.
			</p>

			<div className="mt-10 grid min-w-0 gap-4 sm:grid-cols-2">
				<Card className="min-w-0 overflow-hidden bg-neutral-50">
					<CardHeader>
						<CardTitle>REST</CardTitle>
						<CardDescription className="text-pretty">
							JSON moon phase and hair advice
						</CardDescription>
					</CardHeader>
					<CardContent className="min-w-0 space-y-3 text-sm text-neutral-700">
						<p className="text-pretty">
							<Link href="/api" className="underline underline-offset-4">
								GET /api
							</Link>
							{" — "}
							optional{" "}
							<code className="rounded bg-neutral-200 px-1.5 py-0.5">
								?date=
							</code>
						</p>
						<OriginConfig path="/api" />
					</CardContent>
				</Card>
				<Card className="min-w-0 overflow-hidden bg-neutral-50">
					<CardHeader>
						<CardTitle>MCP</CardTitle>
						<CardDescription className="text-pretty">
							Separate Streamable HTTP server for agents
						</CardDescription>
					</CardHeader>
					<CardContent className="min-w-0 space-y-3 text-sm text-neutral-700">
						<p className="text-pretty">
							Connect to{" "}
							<code className="rounded bg-neutral-200 px-1.5 py-0.5">/mcp</code>
							. No OAuth or token required.
						</p>
						<OriginConfig path="/mcp" kind="mcp" />
					</CardContent>
				</Card>
			</div>

			<section className="mt-14 min-w-0 space-y-4" aria-labelledby="markdown">
				<h2 id="markdown" className="text-2xl font-bold font-sans">
					Website as Markdown
				</h2>
				<p className="text-pretty text-sm text-neutral-600">
					Public pages also respond to{" "}
					<code className="break-all rounded bg-neutral-200 px-1.5 py-0.5">
						Accept: text/markdown
					</code>{" "}
					or{" "}
					<code className="break-all rounded bg-neutral-200 px-1.5 py-0.5">
						Accept: application/markdown
					</code>
					.
				</p>
			</section>

			<section className="mt-14 min-w-0 space-y-4" aria-labelledby="mcp-tools">
				<h2 id="mcp-tools" className="text-2xl font-bold font-sans">
					MCP tools
				</h2>
				<ul className="space-y-2">
					{mcpTools.map((tool) => (
						<li key={tool.name} className="min-w-0 text-sm">
							<code className="break-all rounded bg-neutral-200 px-1.5 py-0.5">
								{tool.name}
							</code>
							<span className="text-neutral-600"> — {tool.detail}</span>
						</li>
					))}
				</ul>
			</section>
		</div>
	);
}
