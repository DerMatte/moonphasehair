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
			<pre className="m-0 max-w-full overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-neutral-900 p-3 text-xs leading-6 text-neutral-100">
				<code>{snippet}</code>
			</pre>
			<CopyButton text={snippet} />
		</div>
	);
}
