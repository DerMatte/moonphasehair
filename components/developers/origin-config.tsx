"use client";

import { useEffect, useState } from "react";
import { CopyButton } from "@/components/developers/copy-button";

export function OriginConfig({
	path,
	kind = "url",
}: {
	path: string;
	kind?: "url" | "mcp";
}) {
	const [origin, setOrigin] = useState("");

	useEffect(() => {
		setOrigin(window.location.origin);
	}, []);

	const url = origin ? `${origin}${path}` : `https://<your-domain>${path}`;
	const snippet =
		kind === "mcp"
			? JSON.stringify(
					{
						mcpServers: {
							"moonphase-hair": {
								url,
							},
						},
					},
					null,
					2,
				)
			: url;

	return (
		<div className="min-w-0 space-y-2">
			<div className="min-w-0 w-full overflow-hidden rounded-lg bg-neutral-900 p-3">
				<code
					className="block w-full font-mono text-xs leading-6 text-neutral-100"
					style={{
						whiteSpace: "pre-wrap",
						overflowWrap: "anywhere",
						wordBreak: "break-word",
					}}
				>
					{snippet}
				</code>
			</div>
			<CopyButton text={snippet} />
		</div>
	);
}
