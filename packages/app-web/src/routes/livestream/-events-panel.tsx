import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDonationEventDateTime, useDonationEvents } from "@/lib/donation-events";
import { CircleAlertIcon, PawPrintIcon } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

export function EventsPanel() {
	const eventListRef = useRef<HTMLUListElement>(null);
	const eventsQuery = useDonationEvents({ limit: 20 });
	const latestEventId = eventsQuery.data?.[0]?.id;

	useLayoutEffect(() => {
		eventListRef.current?.scrollTo({ top: 0 });
	}, [latestEventId]);

	return (
		<section className="flex h-full min-h-0 flex-col overflow-hidden">
			<header className="shrink-0 border-b px-4 py-3">
				<p className="text-sm font-medium">Recent Feeding Station Events</p>
				<p className="text-muted-foreground mt-1 text-xs">
					Latest updates from dispensing, maintenance, and stream uptime.
				</p>
			</header>

			{eventsQuery.isPending ? (
				<ul className="min-h-0 flex-1 divide-y overflow-y-auto pb-10 lg:pb-3">
					{Array.from({ length: 7 }, (_, index) => (
						<li key={`events-panel-skeleton-${index}`} className="px-4 py-3">
							<div className="mb-2 flex items-center justify-between gap-2">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-3 w-20" />
							</div>
							<Skeleton className="h-4 w-full" />
						</li>
					))}
				</ul>
			) : null}

			{eventsQuery.isError ? (
				<div className="flex flex-1 px-4 py-4">
					<Alert variant="destructive">
						<CircleAlertIcon />
						<AlertTitle>Events unavailable</AlertTitle>
						<AlertDescription>The livestream panel could not load feeder events right now.</AlertDescription>
					</Alert>
				</div>
			) : null}

			{eventsQuery.data?.length === 0 ? (
				<div className="flex flex-1 px-4 py-4">
					<Empty className="border-0 px-0 py-10">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<PawPrintIcon />
							</EmptyMedia>
							<EmptyTitle>No station events yet</EmptyTitle>
							<EmptyDescription>New donation and dispense activity will show up here automatically.</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</div>
			) : null}

			{eventsQuery.data?.length ? (
				<ul ref={eventListRef} className="min-h-0 flex-1 divide-y overflow-y-auto pb-10 lg:pb-3">
					{eventsQuery.data.map((event) => (
						<li key={event.id} className="px-4 py-3">
							<div className="mb-1 flex items-center justify-between gap-2">
								<p className="text-sm font-medium">{event.title}</p>
								<time dateTime={event.occurredAt} className="text-muted-foreground text-xs">
									{formatDonationEventDateTime(event.occurredAt)}
								</time>
							</div>
							<p className="text-muted-foreground text-sm">{event.description}</p>
						</li>
					))}
				</ul>
			) : null}
		</section>
	);
}
