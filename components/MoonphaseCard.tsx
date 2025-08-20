import MoonIcon from "./MoonIcon";

// Moon phase card component
export default function MoonPhaseCard({
	title,
	phase,
	phaseValue,
	description,
	emoji,
	dateText,
	action,
}: {
	title: string;
	phase: string;
	phaseValue: number;
	description: string;
	emoji: string;
	dateText?: string;
	action?: string;
}) {
	return (
		<div className=" border-neutral-200 p-6 h-full">
			<div className="flex flex-col items-center text-center space-y-4">
				<MoonIcon phase={phaseValue} />
				<div className="space-y-2">
					<h3 className="font-semibold text-lg text-gray-900">
						{title}: {phase} <span className="text-2xl">{emoji}</span>
					</h3>
					{action && (
						<p className="text-sm font-medium text-gray-700">{action}</p>
					)}
					<p className="text-sm text-gray-600 italic">{description}</p>
					{dateText && <p className="text-xs text-gray-500 mt-2">{dateText}</p>}
				</div>
			</div>
		</div>
	);
}