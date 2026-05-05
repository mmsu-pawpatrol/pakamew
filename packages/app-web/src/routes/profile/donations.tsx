import { Button } from "@/components/ui/button";
import { useDonationEvents } from "@/lib/donation-events";
import { ShortTermDefaultDonationUserId } from "@pakamew/shared/lib/testing";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { DonationHistoryList, FullDonationHistoryLimit, ProfileHero } from "./-profile-shared";

export const Route = createFileRoute("/profile/donations")({
	component: ProfileDonationsPage,
});

function ProfileDonationsPage() {
	const donationHistoryQuery = useDonationEvents({
		limit: FullDonationHistoryLimit,
		userId: ShortTermDefaultDonationUserId,
	});

	return (
		<main className="w-full font-sans">
			<h1 className="sr-only">Donation History</h1>

			<ProfileHero />

			<div className="mx-auto flex w-full max-w-md flex-col gap-5 px-5 pt-5 pb-10 sm:max-w-lg lg:max-w-xl">
				<Button asChild type="button" variant="ghost" className="h-auto w-fit px-0 py-1 pr-3 font-sans">
					<Link to="/profile">
						<ArrowLeftIcon data-icon="inline-start" />
						Back to Profile
					</Link>
				</Button>

				<section className="flex flex-col gap-4">
					<div className="flex items-center justify-between gap-3">
						<h2 className="font-heading text-xl tracking-tight">All Donations</h2>
					</div>

					<DonationHistoryList
						donations={donationHistoryQuery.data}
						emptyDescription="New donations from the seeded test user will appear here automatically."
						errorDescription="The donations page could not load the full test-user donation history right now."
						isError={donationHistoryQuery.isError}
						isPending={donationHistoryQuery.isPending}
						skeletonCount={6}
					/>
				</section>
			</div>
		</main>
	);
}
