import { useORPCClient, type ORPCClient } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";

const EventDateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
	month: "short",
	day: "numeric",
	year: "numeric",
	hour: "numeric",
	minute: "2-digit",
});

/** Donation-backed feeder event returned by the public events route. */
export type DonationEvent = Awaited<ReturnType<ORPCClient["donations"]["events"]>>[number];

/** Input accepted by the shared donation-events query hook. */
export interface UseDonationEventsOptions {
	limit: number;
	userId?: string;
}

/** Load donation-backed feeder events through the shared oRPC route. */
export function useDonationEvents({ limit, userId }: UseDonationEventsOptions) {
	const client = useORPCClient();

	return useQuery({
		queryKey: ["donations", "events", limit, userId ?? null],
		queryFn: async () => await client.donations.events(userId ? { limit, userId } : { limit }),
		staleTime: 30_000,
	});
}

/** Format an event timestamp as absolute donor-facing copy up to minute precision. */
export function formatDonationEventDateTime(occurredAt: string): string {
	return EventDateTimeFormatter.format(new Date(occurredAt));
}
