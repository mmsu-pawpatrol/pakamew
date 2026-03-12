import { LiveBadge, LivestreamFrameShell, LivestreamStatusOverlay } from "@/components/livestream-player";
import { env } from "@/env";
import { useLivestream } from "./use-livestream";

const DESIGN_TIME = true;

export interface LivestreamPlayerProps {
	url?: string;
	alt?: string;
	className?: string;
}

export function LivestreamPlayer({
	url = env.VITE_LIVESTREAM_URL,
	alt = "Livestream camera feed",
	className,
}: LivestreamPlayerProps) {
	const { state, retry } = useLivestream(url, { enabled: !DESIGN_TIME });

	if (DESIGN_TIME) {
		return (
			<div className="relative h-full w-full">
				<LivestreamFrameShell frameUrl="/mr-fresh.jpg" alt={alt} className={className}>
					<div className="absolute top-3 left-3 z-20">
						<LiveBadge />
					</div>
				</LivestreamFrameShell>
			</div>
		);
	}

	const frameUrl = state.status === "live" ? (state.frames[state.url] ?? null) : null;
	const shouldShowLive = !!frameUrl;
	const overlayMode = shouldShowLive ? null : state.status;

	return (
		<div className="relative h-full w-full">
			<LivestreamFrameShell frameUrl={frameUrl} alt={alt} className={className}>
				{shouldShowLive ? (
					<div className="absolute top-3 left-3 z-20">
						<LiveBadge />
					</div>
				) : (
					<LivestreamStatusOverlay
						mode={
							overlayMode === "connecting"
								? "connecting"
								: overlayMode === "connected"
									? "connected"
									: overlayMode === "error"
										? "error"
										: "offline"
						}
						onRetry={
							overlayMode === "offline" || overlayMode === "error" || overlayMode === "connected" ? retry : undefined
						}
					/>
				)}
			</LivestreamFrameShell>
		</div>
	);
}
