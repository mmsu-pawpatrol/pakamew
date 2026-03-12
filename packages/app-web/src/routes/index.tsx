import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LivestreamPlayer } from "@/lib/livestream";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { BoneIcon, HeartHandshakeIcon, PawPrintIcon, ShieldCheckIcon, UserRoundIcon } from "lucide-react";

export const Route = createFileRoute("/")({
	component: Homepage,
});

interface ActivityItem {
	id: string;
	title: string;
	description: string;
	time: string;
	icon: LucideIcon;
}

// Static recent activity entries for the homepage timeline section.
const RECENT_ACTIVITY: ActivityItem[] = [
	{
		id: "feeding-1",
		title: "Feeding Completed",
		description: "Morning feeding was completed for Shelter 2.",
		time: "5 minutes ago",
		icon: BoneIcon,
	},
	{
		id: "health-1",
		title: "Health Check Logged",
		description: "Daily wellness check added for Cocoa.",
		time: "28 minutes ago",
		icon: ShieldCheckIcon,
	},
	{
		id: "rescue-1",
		title: "New Rescue Intake",
		description: "A rescued puppy was registered and placed in quarantine.",
		time: "1 hour ago",
		icon: PawPrintIcon,
	},
	{
		id: "adoption-1",
		title: "Profile Updated",
		description: "Adoption profile details were updated for Mango.",
		time: "2 hours ago",
		icon: UserRoundIcon,
	},
];

function Homepage() {
	return (
		<>
			<main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 pt-6 pb-10 sm:px-6 sm:pt-8 sm:pb-8 lg:gap-8 lg:pt-10">
				{/* Header with title and profile shortcut */}
				<header className="flex items-center justify-between gap-4">
					<div className="flex flex-col gap-1">
						<p className="text-muted-foreground text-sm">Live Shelter Feed</p>
						<h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">MMSU CCIS - Station</h1>
					</div>

					<div className="flex items-center gap-2">
						<ThemeToggleButton />

						<Button asChild variant="ghost" size="icon-lg" className="rounded-full p-0">
							<Link to="/profile" aria-label="Open profile">
								<Avatar size="lg">
									<AvatarFallback>PA</AvatarFallback>
								</Avatar>
							</Link>
						</Button>
					</div>
				</header>

				{/* Livestream preview card */}
				<Card className="gap-0 overflow-hidden py-0">
					<AspectRatio ratio={16 / 9} className="bg-muted relative overflow-hidden">
						<LivestreamPlayer alt="Shelter livestream preview" className="h-full w-full" />

						{/* Desktop CTA overlay for stream context and quick action */}
						<div className="absolute inset-x-0 bottom-0 hidden md:block">
							<div className="bg-background/70 border-border/50 flex items-center justify-between gap-4 border-t px-6 py-4 backdrop-blur-sm">
								<div className="flex min-w-0 flex-col gap-1">
									<p className="font-medium">Shelter Camera Preview</p>
									<p className="text-muted-foreground text-sm">
										Open the full stream to monitor activity in real time.
									</p>
								</div>

								<Button asChild variant="outline" className="shrink-0">
									<Link to="/livestream">
										<PawPrintIcon data-icon="inline-start" />
										Open Stream
									</Link>
								</Button>
							</div>
						</div>
					</AspectRatio>

					{/* Mobile preview context and stream CTA */}
					<CardFooter className="flex flex-col items-stretch gap-3 border-t px-4 py-4 sm:flex-row sm:justify-between sm:px-6 md:hidden">
						<div className="flex flex-col gap-1">
							<p className="font-medium">Shelter Camera Preview</p>
							<p className="text-muted-foreground text-sm">Open the full stream to monitor activity in real time.</p>
						</div>

						<Button asChild variant="outline">
							<Link to="/livestream">
								<PawPrintIcon data-icon="inline-start" />
								Open Stream
							</Link>
						</Button>
					</CardFooter>
				</Card>

				{/* Primary donation call-to-action */}
				<section className="flex justify-center">
					<Button asChild size="lg" className="w-full max-w-sm">
						<Link to="/donate">
							<HeartHandshakeIcon data-icon="inline-start" />
							Donate Now
						</Link>
					</Button>
				</section>

				{/* Recent activity timeline */}
				<section className="flex flex-col gap-4 sm:gap-5">
					<div className="flex items-center justify-between gap-3">
						<h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
						<Button asChild variant="ghost" size="sm">
							<Link to="/livestream">View Live Feed</Link>
						</Button>
					</div>

					<div className="flex flex-col gap-3 sm:gap-4">
						{RECENT_ACTIVITY.map((activity) => {
							const Icon = activity.icon;
							return (
								<Card key={activity.id} size="sm" className="gap-0 py-0">
									{/* Activity entry with icon and metadata */}
									<CardContent className="flex items-start gap-3 px-4 py-4 sm:px-5">
										<div className="bg-muted text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-full [&_svg]:size-4">
											<Icon />
										</div>

										<div className="flex min-w-0 flex-1 flex-col gap-2">
											<div className="flex flex-wrap items-center justify-between gap-2">
												<h3 className="text-sm font-medium">{activity.title}</h3>
												<span className="text-muted-foreground text-xs">{activity.time}</span>
											</div>
											<Separator />
											<p className="text-muted-foreground text-sm">{activity.description}</p>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</section>
			</main>
		</>
	);
}
