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
		<div className="space-y-3">
			<div className="flex items-start justify-between gap-3">
				<pre className="m-0 min-w-0 flex-1 overflow-x-auto rounded-lg bg-neutral-900 p-4 text-xs leading-6 text-neutral-100">
					<code>{snippet}</code>
				</pre>
				<CopyButton text={snippet} />
			</div>
		</div>
	);
}
