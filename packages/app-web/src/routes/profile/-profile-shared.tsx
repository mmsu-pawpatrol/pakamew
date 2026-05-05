import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDonationEventDateTime, type DonationEvent } from "@/lib/donation-events";
import { cn } from "@/lib/utils";
import { CircleAlertIcon, Clock3Icon, PawPrintIcon } from "lucide-react";

const Profile = {
	name: "Test User",
	role: "Student / Volunteer",
	initials: "TU",
};

/** Number of donations rendered on the profile overview before linking out. */
export const InitialDonationHistoryLimit = 3;

/** One extra row lets the profile overview detect more history without showing it. */
export const InitialDonationHistoryQueryLimit = InitialDonationHistoryLimit + 1;

/** Highest donation history page size currently accepted by the events API. */
export const FullDonationHistoryLimit = 50;

const PesoFormatter = new Intl.NumberFormat("en-PH", {
	style: "currency",
	currency: "PHP",
	maximumFractionDigits: 0,
});

function getDonationTone(displayStatus: DonationEvent["displayStatus"]): string {
	return displayStatus === "Dispensed" ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground";
}

/** Shared profile hero used by the profile overview and donation history pages. */
export function ProfileHero() {
	return (
		<section className="shadow-primary/20 relative w-full overflow-hidden bg-[linear-gradient(160deg,var(--color-chart-5)_0%,var(--color-primary)_58%,var(--color-chart-2)_100%)] px-5 py-8 text-center text-white shadow-xl">
			<PawPrintIcon
				aria-hidden="true"
				className="pointer-events-none absolute bottom-5 -left-5 size-14 rotate-[-18deg] text-white/10"
			/>
			<PawPrintIcon
				aria-hidden="true"
				className="pointer-events-none absolute top-5 right-4 size-10 rotate-16 text-white/14"
			/>
			<PawPrintIcon
				aria-hidden="true"
				className="pointer-events-none absolute right-12 bottom-8 size-8 rotate-28 text-white/12"
			/>

			<div className="relative flex flex-col items-center gap-4">
				<Avatar className="size-24 border-4 border-white/95 bg-white/18 shadow-lg shadow-black/10">
					<AvatarFallback className="font-heading bg-white/18 text-3xl font-extrabold text-white">
						{Profile.initials}
					</AvatarFallback>
				</Avatar>

				<div className="flex flex-col items-center gap-2.5">
					<div className="flex flex-col gap-1">
						<p className="font-heading text-[1.7rem] leading-none font-extrabold tracking-tight text-white">
							{Profile.name}
						</p>
						<p className="font-sans text-xs font-bold tracking-[0.22em] text-white/78 uppercase">{Profile.role}</p>
					</div>
				</div>
			</div>
		</section>
	);
}

/** Donation history state renderer shared by profile donation pages. */
export function DonationHistoryList({
	donations,
	emptyDescription,
	errorDescription,
	isError,
	isPending,
	skeletonCount,
}: {
	donations: DonationEvent[] | undefined;
	emptyDescription: string;
	errorDescription: string;
	isError: boolean;
	isPending: boolean;
	skeletonCount: number;
}) {
	return (
		<div className="flex flex-col gap-3">
			{isPending
				? Array.from({ length: skeletonCount }, (_, index) => (
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

			{isError ? (
				<Alert variant="destructive">
					<CircleAlertIcon />
					<AlertTitle>Donation history is unavailable</AlertTitle>
					<AlertDescription>{errorDescription}</AlertDescription>
				</Alert>
			) : null}

			{donations?.length === 0 ? (
				<Empty className="py-10">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Clock3Icon />
						</EmptyMedia>
						<EmptyTitle>No donations yet</EmptyTitle>
						<EmptyDescription>{emptyDescription}</EmptyDescription>
					</EmptyHeader>
				</Empty>
			) : null}

			{donations?.map((donation) => (
				<DonationHistoryRow key={donation.id} donation={donation} />
			))}
		</div>
	);
}

function DonationHistoryRow({ donation }: { donation: DonationEvent }) {
	const donationDateTime = formatDonationEventDateTime(donation.occurredAt);

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
					<time dateTime={donation.occurredAt} className="text-muted-foreground font-sans text-sm">
						{donationDateTime}
					</time>
				</div>

				<p className="font-heading text-primary shrink-0 font-bold">{PesoFormatter.format(donation.amount)}</p>
			</CardContent>
		</Card>
	);
}
