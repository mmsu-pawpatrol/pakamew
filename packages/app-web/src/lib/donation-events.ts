import { useORPCClient, type ORPCClient } from "@/lib/orpc";
import { useQuery } from "@tanstack/react-query";

const RelativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
	numeric: "auto",
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

/** Format an event timestamp into short relative donor-facing copy. */
export function formatDonationEventRelativeTime(occurredAt: string): string {
	const deltaSeconds = Math.round((new Date(occurredAt).getTime() - Date.now()) / 1000);
	const absoluteDeltaSeconds = Math.abs(deltaSeconds);

	if (absoluteDeltaSeconds < 60) return RelativeTimeFormatter.format(deltaSeconds, "second");
	if (absoluteDeltaSeconds < 3_600) return RelativeTimeFormatter.format(Math.round(deltaSeconds / 60), "minute");
	if (absoluteDeltaSeconds < 86_400) return RelativeTimeFormatter.format(Math.round(deltaSeconds / 3_600), "hour");
	if (absoluteDeltaSeconds < 2_592_000) return RelativeTimeFormatter.format(Math.round(deltaSeconds / 86_400), "day");

	return RelativeTimeFormatter.format(Math.round(deltaSeconds / 2_592_000), "month");
}
