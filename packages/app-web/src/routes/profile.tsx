import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useDonationEvents, type DonationEvent } from "@/lib/donation-events";
import { cn } from "@/lib/utils";
import { ShortTermDefaultDonationUserId } from "@pakamew/shared/lib/testing";
import { createFileRoute } from "@tanstack/react-router";
import { CircleAlertIcon, Clock3Icon, PawPrintIcon } from "lucide-react";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

const PROFILE = {
	name: "Test User",
	role: "Student / Volunteer",
	initials: "TU",
};

const PESO_FORMATTER = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0,
});

const PROFILE_DATE_FORMATTER = new Intl.DateTimeFormat("en-PH", {
	month: "short",
	day: "numeric",
	year: "numeric",
});

function getDonationTone(displayStatus: DonationEvent["displayStatus"]): string {
	return displayStatus === "Dispensed" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground";
}

function ProfilePage() {
	const donationHistoryQuery = useDonationEvents({
		limit: 24,
		userId: ShortTermDefaultDonationUserId,
	});

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
				</div>
			</section>

			<div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pt-6 pb-10 sm:max-w-lg lg:max-w-xl">
				<section className="flex flex-col gap-4">
					<div className="flex items-center justify-between gap-3">
						<h2 className="font-heading text-xl tracking-tight">Donation History</h2>
					</div>
					<div className="flex flex-col gap-3">
						{donationHistoryQuery.isPending
							? Array.from({ length: 4 }, (_, index) => (
									<Card key={`profile-donation-skeleton-${index}`} size="sm" className="gap-0 py-0">
										<CardContent className="flex items-center gap-3 px-4 py-4">
											<Skeleton className="size-10 rounded-full" />
											<div className="flex min-w-0 flex-1 flex-col gap-2">
												<Skeleton className="h-4 w-28" />
												<Skeleton className="h-4 w-20" />
											</div>
											<Skeleton className="h-5 w-16" />
										</CardContent>
									</Card>
								))
							: null}

						{donationHistoryQuery.isError ? (
							<Alert variant="destructive">
								<CircleAlertIcon />
								<AlertTitle>Donation history is unavailable</AlertTitle>
								<AlertDescription>
									The profile page could not load the test-user donation history right now.
								</AlertDescription>
							</Alert>
						) : null}

						{donationHistoryQuery.data?.length === 0 ? (
							<Empty className="py-10">
								<EmptyHeader>
									<EmptyMedia variant="icon">
										<Clock3Icon />
									</EmptyMedia>
									<EmptyTitle>No donations yet</EmptyTitle>
									<EmptyDescription>
										New donations from the seeded test user will appear here automatically.
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						) : null}

						{donationHistoryQuery.data?.map((donation) => (
							<DonationHistoryRow key={donation.id} donation={donation} />
						))}
					</div>
				</section>
			</div>
		</main>
	);
}

function DonationHistoryRow({ donation }: { donation: DonationEvent }) {
	const donationDate = PROFILE_DATE_FORMATTER.format(new Date(donation.occurredAt));

	return (
		<Card size="sm" className="gap-0 py-0">
			<CardContent className="flex items-center gap-3 px-4 py-4">
				<Avatar className="after:border-border size-10">
					<AvatarFallback className={cn("text-foreground [&_svg]:size-5", getDonationTone(donation.displayStatus))}>
						<PawPrintIcon />
					</AvatarFallback>
				</Avatar>

				<div className="flex min-w-0 flex-1 flex-col">
					<p className="truncate font-sans text-sm font-semibold">You Donated</p>
					<p className="text-muted-foreground font-sans text-sm">{donationDate}</p>
				</div>

				<p className="font-heading text-primary shrink-0 font-bold">{PESO_FORMATTER.format(donation.amount)}</p>
			</CardContent>
		</Card>
	);
}
