import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useDonationEvents } from "@/lib/donation-events";
import { ShortTermDefaultDonationUserId } from "@pakamew/shared/lib/testing";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ChartColumnIcon, ChevronRightIcon, LockKeyholeIcon } from "lucide-react";
import {
	DonationHistoryList,
	InitialDonationHistoryLimit,
	InitialDonationHistoryQueryLimit,
	ProfileHero,
} from "./profile/-profile-shared";

export const Route = createFileRoute("/profile")({
	component: ProfileRoute,
});

function ProfileRoute() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const isProfileIndex = pathname === "/profile" || pathname === "/profile/";

	return isProfileIndex ? <ProfilePage /> : <Outlet />;
}

function ProfilePage() {
	const donationHistoryQuery = useDonationEvents({
		limit: InitialDonationHistoryQueryLimit,
		userId: ShortTermDefaultDonationUserId,
	});
	const visibleDonations = donationHistoryQuery.data?.slice(0, InitialDonationHistoryLimit);
	const shouldShowAllDonationsAction = (donationHistoryQuery.data?.length ?? 0) > InitialDonationHistoryLimit;

	return (
		<main className="w-full font-sans">
			<h1 className="sr-only">Profile</h1>

			<ProfileHero />

			<div className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pt-6 pb-10 sm:max-w-lg lg:max-w-xl">
				<section className="flex flex-col gap-4">
					<div className="flex items-center justify-between gap-3">
						<h2 className="font-heading text-xl tracking-tight">Donation History</h2>
					</div>
					<div className="flex flex-col gap-3">
						<DonationHistoryList
							donations={visibleDonations}
							emptyDescription="New donations from the seeded test user will appear here automatically."
							errorDescription="The profile page could not load the test-user donation history right now."
							isError={donationHistoryQuery.isError}
							isPending={donationHistoryQuery.isPending}
							skeletonCount={InitialDonationHistoryLimit}
						/>

						{shouldShowAllDonationsAction ? (
							<Button
								asChild
								type="button"
								variant="ghost"
								className="text-primary font-heading h-auto self-end px-0 py-1 pl-3.5 text-sm font-bold tracking-wide">
								<Link to="/profile/donations">
									View All Donations
									<ChevronRightIcon data-icon="inline-end" />
								</Link>
							</Button>
						) : null}
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
