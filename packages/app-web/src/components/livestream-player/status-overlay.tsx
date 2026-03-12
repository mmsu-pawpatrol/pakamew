import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { RefreshCwIcon } from "lucide-react";

export type LivestreamStatusOverlayMode = "connecting" | "connected" | "offline" | "error" | "paused";

export interface LivestreamStatusOverlayProps {
	mode: LivestreamStatusOverlayMode;
	onRetry?: () => void;
}

const OVERLAY_COPY: Record<LivestreamStatusOverlayMode, { title: string; description: string }> = {
	connecting: {
		title: "Connecting to live feed...",
		description: "Preparing livestream session.",
	},
	connected: {
		title: "Connected to livestream server",
		description: "Waiting for camera feed ...",
	},
	offline: {
		title: "Live feed unavailable",
		description: "The stream is currently offline. Retry when ready.",
	},
	error: {
		title: "Stream connection error",
		description: "A connection issue occurred. Retry to reconnect.",
	},
	paused: {
		title: "Paused",
		description: "Activate this player to resume live playback.",
	},
};

export function LivestreamStatusOverlay({ mode, onRetry }: LivestreamStatusOverlayProps) {
	const copy = OVERLAY_COPY[mode];
	const canRetry = (mode === "offline" || mode === "error") && typeof onRetry === "function";

	return (
		<div className="absolute inset-0">
			<img
				src="/mr-fresh.jpg"
				alt=""
				aria-hidden
				className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-100"
			/>
			<Empty className="relative h-full rounded-none border-0 bg-black/80 p-6 backdrop-blur-xs">
				<EmptyHeader>
					{mode === "connecting" || mode === "connected" ? (
						<EmptyMedia
							variant="icon"
							className="border-white/15 bg-white/10 text-white [&_svg:not([class*='size-'])]:size-5">
							<Spinner className="text-white" />
						</EmptyMedia>
					) : null}
					<EmptyTitle className="text-white">{copy.title}</EmptyTitle>
					<EmptyDescription className="text-white/80">{copy.description}</EmptyDescription>
				</EmptyHeader>
				{canRetry ? (
					<EmptyContent>
						<Button type="button" variant="secondary" onClick={onRetry}>
							<RefreshCwIcon data-icon="inline-start" />
							Retry now
						</Button>
					</EmptyContent>
				) : null}
			</Empty>
		</div>
	);
}
