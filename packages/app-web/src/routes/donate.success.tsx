import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LivestreamPlayer } from "@/lib/livestream";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2Icon, HeartHandshakeIcon, SparklesIcon, VideoIcon } from "lucide-react";

export const Route = createFileRoute("/donate/success")({
	component: DonateSuccessPage,
});

interface ImpactPoint {
	id: string;
	title: string;
	description: string;
	icon: typeof HeartHandshakeIcon;
}

const IMPACT_POINTS: ImpactPoint[] = [
	{
		id: "daily-care",
		title: "Daily Care",
		description: "Your support helps fund food and medical care for stray animals visiting the stations.",
		icon: HeartHandshakeIcon,
	},
	{
		id: "operational-support",
		title: "Operational Support",
		description: "Donations also help keep stations cleaner and safer for visiting strays.",
		icon: SparklesIcon,
	},
];

function DonateSuccessPage() {
	return (
		<main className="mx-auto flex min-h-full w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
			<section className="w-full">
				<header className="flex flex-col gap-3 px-1 pt-1 pb-6 sm:px-2 sm:pb-8">
					<Badge variant="secondary" className="w-fit">
						<CheckCircle2Icon data-icon="inline-start" />
						Donation Received
					</Badge>
					<h1 className="text-3xl font-semibold tracking-tight sm:text-3xl">Thank you for donating!</h1>
					<p className="text-muted-foreground text-sm sm:text-base">
						Every contribution helps stray animals stay fed, protected, and cared for while they wait for a home.
					</p>
				</header>

				<AspectRatio ratio={16 / 9} className="bg-muted relative overflow-hidden rounded-xl">
					<LivestreamPlayer alt="Shelter livestream preview" className="h-full w-full" />
				</AspectRatio>

				<section className="px-1 py-6 sm:px-2 sm:py-7">
					<ul className="grid gap-3 sm:grid-cols-2">
						{IMPACT_POINTS.map((point) => {
							const Icon = point.icon;

							return (
								<li key={point.id} className="bg-muted/30 flex flex-col gap-2 rounded-lg border p-4">
									<div className="flex items-center gap-2 text-sm font-medium">
										<Icon className="text-muted-foreground size-4" />
										<span>{point.title}</span>
									</div>
									<p className="text-muted-foreground text-sm leading-relaxed">{point.description}</p>
								</li>
							);
						})}
					</ul>
				</section>

				{/* <Separator /> */}

				<footer className="flex flex-col items-stretch gap-3 px-1 sm:px-2">
					<Button asChild size="lg" className="w-full sm:w-auto sm:self-start">
						<Link to="/livestream">
							<VideoIcon data-icon="inline-start" />
							Continue to Livestream
						</Link>
					</Button>
					<p className="text-muted-foreground text-xs sm:text-sm">
						Want to see your support in action? Head to the live feed for shelter updates.
					</p>
				</footer>
			</section>
		</main>
	);
}
