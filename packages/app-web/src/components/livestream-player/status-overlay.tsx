import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { RadioIcon, RefreshCwIcon } from "lucide-react";

export type LivestreamStatusOverlayMode = "no-source" | "offline" | "error";

export interface LivestreamStatusOverlayProps {
	mode: LivestreamStatusOverlayMode;
	onRetry?: () => void;
}

const OVERLAY_COPY: Record<LivestreamStatusOverlayMode, { title: string; description: string }> = {
	"no-source": {
		title: "No playable livestream source",
		description: "Configure an HLS URL or enable the websocket source to preview frames.",
	},
	"error": {
		title: "Playback error",
		description: "Retry the active source to remount the player surface.",
	},
	"offline": {
		title: "Livestream offline",
		description: "The active livestream source is currently unavailable. Retry once the stream is back.",
	},
};

export function LivestreamStatusOverlay({ mode, onRetry }: LivestreamStatusOverlayProps) {
	const copy = OVERLAY_COPY[mode];
	const canRetry = (mode === "error" || mode === "offline") && typeof onRetry === "function";

	return (
		<div className="absolute inset-0">
			<Empty className="relative h-full rounded-none border-0 bg-black/80 p-6 text-white backdrop-blur-xs">
				<EmptyHeader>
					<EmptyMedia
						variant="icon"
						className="border-white/15 bg-white/10 text-white [&_svg:not([class*='size-'])]:size-5">
						<RadioIcon className={mode === "error" ? "" : "opacity-75"} />
					</EmptyMedia>
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
