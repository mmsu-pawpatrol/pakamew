/**
 * Public donation success and fulfillment status page.
 */

import { LivestreamPlayer } from "@/components/livestream-player";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useORPCClient } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleAlertIcon, HeartHandshakeIcon, SparklesIcon, VideoIcon } from "lucide-react";

/** Donation success page route with donor status polling. */
export const Route = createFileRoute("/donate/success")({
	validateSearch: (search: Record<string, unknown>) => ({
		donationId: typeof search.donationId === "string" ? search.donationId : "",
	}),
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

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : "Unable to load donation status right now.";
}

function getStatusText(displayStatus: string | undefined, hasError: boolean): string {
	if (hasError) return "Unable to refresh donation status right now.";
	return displayStatus ?? "Waiting for the first status update from the server.";
}

function DonateSuccessPage() {
	const client = useORPCClient();
	const { donationId } = Route.useSearch();

	const statusQuery = useQuery({
		queryKey: ["donations", "status", donationId],
		enabled: donationId.length > 0,
		queryFn: async () => await client.donations.status({ donationId }),
		refetchInterval: (query) => {
			const displayStatus = query.state.data?.displayStatus;
			if (displayStatus === "Dispensed" || displayStatus === "Payment session expired. Please try again.") {
				return false;
			}

			return 2000;
		},
		retry: false,
	});

	const displayStatus = statusQuery.data?.displayStatus;
	const showExpiredAlert = displayStatus === "Payment session expired. Please try again.";
	const isTerminalStatus = displayStatus === "Dispensed" || showExpiredAlert || statusQuery.isError;
	const statusText = getStatusText(displayStatus, statusQuery.isError);

	return (
		<main className="mx-auto flex min-h-full w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
			<section className="flex w-full flex-col gap-6">
				<header className="flex flex-col gap-3 px-1 pt-1 pb-3 sm:px-2 sm:py-8">
					<h1 className="text-3xl font-semibold tracking-tight sm:text-3xl">Thank you for donating!</h1>
					<p className="text-muted-foreground text-sm sm:text-base">
						Keep the livestream open while Pakamew confirms your payment and attempts the feeder dispense.
					</p>
				</header>

				{donationId.length === 0 ? (
					<Alert variant="destructive">
						<CircleAlertIcon />
						<AlertTitle>Missing donation reference</AlertTitle>
						<AlertDescription>
							Open this page from the checkout return link to track the donation status.
						</AlertDescription>
					</Alert>
				) : null}

				<section className="flex flex-col gap-2">
					<div className="text-muted-foreground flex min-h-6 items-center gap-2 px-1 text-sm">
						{isTerminalStatus ? null : <Spinner aria-hidden />}
						<span>{statusText}</span>
					</div>

					<AspectRatio ratio={16 / 9} className="bg-muted relative overflow-hidden rounded-xl">
						<LivestreamPlayer alt="Shelter livestream preview" className="h-full w-full" />
					</AspectRatio>
				</section>

				{statusQuery.isError ? (
					<Alert variant="destructive">
						<CircleAlertIcon />
						<AlertTitle>Status refresh failed</AlertTitle>
						<AlertDescription>{getErrorMessage(statusQuery.error)}</AlertDescription>
					</Alert>
				) : null}

				{showExpiredAlert ? (
					<Alert variant="destructive">
						<CircleAlertIcon />
						<AlertTitle>Payment session expired</AlertTitle>
						<AlertDescription>Return to the donation page to start a new checkout session.</AlertDescription>
					</Alert>
				) : null}

				<section className="px-1 py-2 sm:px-2 sm:py-3">
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

				<Separator />

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
