import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FastingQuickTips() {
	return (
		<Card className="bg-neutral-50">
			<CardHeader>
				<CardTitle className="text-lg">Quick Tips</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-3">
					<div className="grid gap-2 grid-cols-[auto_1fr] items-start">
						<CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
						<p className="text-sm">
							JUST STOP EATING. No Calories. No Coffee. No Tea.
						</p>
					</div>
					<div className="grid gap-2 grid-cols-[auto_1fr] items-start">
						<CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
						<p className="text-sm">
							Drink lots of water at least 4l. Bonus: add celtic sea salt +
							lemon juice.
						</p>
					</div>
					<div className="grid gap-2 grid-cols-[auto_1fr] items-start">
						<CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
						<p className="text-sm">
							Autogaphy starts at 24h. This is where your body starts to
							regenerate cells. Hour 36 – 48 is the hardest. After 72+ you
							completely loose your hunger.
						</p>
					</div>
					<div className="grid gap-2 grid-cols-[auto_1fr] items-start">
						<CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
						<p className="text-sm">
							Break your fast with bone broth or soup. HALF the length of the
							fast = the length of time you should take to reactivate digestion
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
