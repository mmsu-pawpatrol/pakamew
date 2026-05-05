import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
	CatIcon,
	ChartColumnIcon,
	ChevronRightIcon,
	DogIcon,
	LockKeyholeIcon,
	LogOutIcon,
	PawPrintIcon,
	PencilIcon,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

interface DonationHistoryItem {
	id: string;
	title: string;
	date: string;
	amount: number;
	icon: LucideIcon;
	tone: string;
}

const PROFILE = {
	name: "Jm Benito",
	role: "Host / Stray Feeder",
	initials: "JB",
	totalDonated: 60,
};

const PESO_FORMATTER = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0,
});

const DONATION_HISTORY: DonationHistoryItem[] = [
	{
		id: "dog-feeding",
		title: "You Donated",
		date: "Feb 2, 2026",
		amount: 20,
		icon: DogIcon,
		tone: "bg-accent text-accent-foreground",
	},
	{
		id: "cat-feeding",
		title: "You Donated",
		date: "Feb 2, 2026",
		amount: 20,
		icon: CatIcon,
		tone: "bg-secondary text-secondary-foreground",
	},
	{
		id: "campus-feeding",
		title: "You Donated",
		date: "Feb 2, 2026",
		amount: 20,
		icon: PawPrintIcon,
		tone: "bg-muted text-muted-foreground",
	},
];

const HERO_ACTION_BUTTON_CLASSNAME =
	"h-11 rounded-full border-white/55 bg-white/18 px-4 text-white shadow-none backdrop-blur-sm hover:bg-white/28 hover:text-white dark:border-white/40 dark:bg-white/12 dark:text-white dark:hover:bg-white/22";

function ProfilePage() {
	return (
		<main className="w-full font-sans">
			<h1 className="sr-only">Profile</h1>

			{/* PROFILE HERO */}
			<section className="shadow-primary/20 relative w-full overflow-hidden bg-[linear-gradient(160deg,var(--color-chart-5)_0%,var(--color-primary)_58%,var(--color-chart-2)_100%)] px-5 py-8 text-center text-white shadow-xl">
				<PawPrintIcon
					aria-hidden="true"
					className="pointer-events-none absolute bottom-5 -left-5 size-14 rotate-[-18deg] text-white/10"
				/>
				<PawPrintIcon
					aria-hidden="true"
					className="pointer-events-none absolute top-5 right-4 size-10 rotate-[16deg] text-white/14"
				/>
				<PawPrintIcon
					aria-hidden="true"
					className="pointer-events-none absolute right-12 bottom-8 size-8 rotate-[28deg] text-white/12"
				/>

				<div className="relative flex flex-col items-center gap-4">
					<Avatar className="size-24 border-4 border-white/95 bg-white/18 shadow-lg shadow-black/10">
						<AvatarFallback className="font-heading bg-white/18 text-3xl font-extrabold text-white">
							{PROFILE.initials}
						</AvatarFallback>
					</Avatar>

					<div className="flex flex-col items-center gap-2.5">
						<div className="flex flex-col gap-1">
							<p className="font-heading text-[1.7rem] leading-none font-extrabold tracking-tight text-white">
								{PROFILE.name}
							</p>
							<p className="font-sans text-xs font-bold tracking-[0.22em] text-white/78 uppercase">{PROFILE.role}</p>
						</div>
					</div>

					<div className="grid w-full max-w-sm grid-cols-2 gap-3 pt-1">
						<Button type="button" variant="outline" disabled className={HERO_ACTION_BUTTON_CLASSNAME}>
							<PencilIcon data-icon="inline-start" />
							Edit Profile
						</Button>
						<Button type="button" variant="outline" disabled className={HERO_ACTION_BUTTON_CLASSNAME}>
							<LogOutIcon data-icon="inline-start" />
							Log Out
						</Button>
					</div>
				</div>
			</section>

			{/* ✅ CENTERED CONTENT WRAPPER */}
			<div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pt-6 pb-10 sm:max-w-lg lg:max-w-xl">
				{/* DONATION HISTORY */}
				<section className="flex flex-col gap-4">
					<div className="flex items-center justify-between gap-3">
						<h2 className="font-heading text-xl tracking-tight">Donation History</h2>
						<Button type="button" variant="ghost" size="sm" disabled>
							View All
						</Button>
					</div>

					<div className="flex flex-col gap-3">
						{DONATION_HISTORY.map((donation) => (
							<DonationHistoryRow key={donation.id} donation={donation} />
						))}
					</div>
				</section>

				{/* CAMPUS REPORTS */}
				<section>
					<Card className="gap-0 py-0">
						<CardHeader className="bg-accent gap-0 px-4 py-4">
							<div className="flex items-start gap-3">
								<div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
									<LockKeyholeIcon className="size-5" />
								</div>

								<div className="flex min-w-0 flex-1 flex-col gap-1">
									<CardTitle className="font-heading">Campus Reports</CardTitle>

									<p className="text-muted-foreground font-sans text-sm">
										Generated reports are limited to coordinator access.
									</p>

									<Badge variant="outline" className="mt-1 w-fit font-sans">
										Coordinator only
									</Badge>
								</div>
							</div>
						</CardHeader>

						<Separator />

						<CardContent className="px-4 py-1">
							<Button
								type="button"
								variant="ghost"
								disabled
								className="h-auto w-full justify-start px-0 py-3 disabled:opacity-75">
								<ChartColumnIcon data-icon="inline-start" />
								<span className="min-w-0 flex-1 truncate text-left font-sans">View Generated Reports</span>
								<ChevronRightIcon data-icon="inline-end" />
							</Button>
						</CardContent>
					</Card>
				</section>
			</div>
		</main>
	);
}

function DonationHistoryRow({ donation }: { donation: DonationHistoryItem }) {
	const Icon = donation.icon;

	return (
		<Card size="sm" className="gap-0 py-0">
			<CardContent className="flex items-center gap-3 px-4 py-4">
				<Avatar className="after:border-border size-10">
					<AvatarFallback className={cn("text-foreground [&_svg]:size-5", donation.tone)}>
						<Icon />
					</AvatarFallback>
				</Avatar>

				<div className="flex min-w-0 flex-1 flex-col">
					<p className="truncate font-sans text-sm font-semibold">{donation.title}</p>
					<p className="text-muted-foreground font-sans text-sm">{donation.date}</p>
				</div>

				<p className="font-heading text-primary shrink-0 font-bold">{PESO_FORMATTER.format(donation.amount)}</p>
			</CardContent>
		</Card>
	);
}
