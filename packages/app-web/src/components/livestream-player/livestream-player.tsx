import { Button } from "@/components/ui/button";
import { env } from "@/env";
import { createLivestream } from "@/lib/livestream/create-livestream";
import { resolvePlaybackAvailabilityFromEnv } from "@/lib/livestream/resolve-playback";
import type { PlaybackAvailability, PlaybackChrome, PlaybackSourceKind } from "@/lib/livestream/types";
import { cn } from "@/lib/utils";
import { CodeXml, PlayIcon, RefreshCwIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { LiveBadge } from "./live-badge";
import { LivestreamStatusOverlay } from "./status-overlay";

export interface LivestreamPlayerProps {
	availability?: PlaybackAvailability;
	alt?: string;
	className?: string;
	chrome?: PlaybackChrome;
}

function getDebugToggleTarget(
	sources: { kind: PlaybackSourceKind; url: string }[],
	activeSourceKind: PlaybackSourceKind | null,
) {
	const hasHls = sources.some((source) => source.kind === "hls");
	const hasWebsocket = sources.some((source) => source.kind === "websocket");

	if (!hasHls || !hasWebsocket) {
		return null;
	}

	return activeSourceKind === "websocket" ? "hls" : "websocket";
}

function RealLivestreamPlayer({
	availability,
	className,
	chrome,
}: Required<Pick<LivestreamPlayerProps, "availability" | "chrome">> & Pick<LivestreamPlayerProps, "className">) {
	const runtime = useMemo(() => {
		return createLivestream(availability, { chrome });
	}, [availability, chrome]);
	const surfaceRef = useRef<HTMLDivElement | null>(null);
	const snapshot = useSyncExternalStore(runtime.subscribe, runtime.snapshot, runtime.snapshot);

	useEffect(() => {
		return () => {
			runtime.dispose();
		};
	}, [runtime]);

	useEffect(() => {
		const surface = surfaceRef.current;

		if (!surface) {
			return;
		}

		return runtime.mount(surface);
	}, [runtime]);

	const overlayMode =
		snapshot.sourceKind === null
			? "no-source"
			: snapshot.status === "error"
				? "error"
				: snapshot.status === "offline"
					? "offline"
					: null;
	const isLive = snapshot.status === "live";
	const activeSourceKind = snapshot.sourceKind ?? snapshot.targetSourceKind;
	const debugToggleTarget = getDebugToggleTarget(snapshot.sources, activeSourceKind);
	const isInteractiveChrome = chrome === "interactive";

	return (
		<div className="relative h-full w-full overflow-hidden bg-black">
			<div ref={surfaceRef} className={cn("h-full w-full overflow-hidden bg-black", className)} />

			<div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-3">
				<LiveBadge live={isLive} />

				<div className="pointer-events-auto flex items-center gap-2">
					{isInteractiveChrome && debugToggleTarget ? (
						<Button
							type="button"
							size="sm"
							variant="ghost"
							className="h-6.25 rounded-full bg-black/33 text-xs font-medium text-white shadow-sm hover:bg-black/66 hover:text-white"
							onClick={() => {
								runtime.switch(debugToggleTarget);
							}}>
							{debugToggleTarget !== "websocket" ? (
								<CodeXml data-icon="inline-start" />
							) : (
								<PlayIcon data-icon="inline-start" />
							)}
							{debugToggleTarget !== "websocket" ? "Raw" : "Playback"}
						</Button>
					) : null}
				</div>
			</div>

			{isInteractiveChrome && snapshot.canRetry && overlayMode === null && snapshot.sourceKind ? (
				<div className="pointer-events-none absolute right-3 bottom-3 z-20">
					<Button type="button" size="sm" variant="secondary" className="pointer-events-auto" onClick={runtime.retry}>
						<RefreshCwIcon data-icon="inline-start" />
						Retry
					</Button>
				</div>
			) : null}

			{overlayMode ? <LivestreamStatusOverlay mode={overlayMode} onRetry={runtime.retry} /> : null}
		</div>
	);
}

function MockLivestreamPlayer({
	alt,
	className,
}: Required<Pick<LivestreamPlayerProps, "alt">> & Pick<LivestreamPlayerProps, "className">) {
	return (
		<div className="relative h-full w-full overflow-hidden bg-black">
			<img src="/mr-fresh.jpg" alt={alt} className={cn("h-full w-full object-cover", className)} />
			<div className="absolute top-3 left-3 z-20">
				<LiveBadge />
			</div>
		</div>
	);
}

export function LivestreamPlayer({
	availability,
	alt = "Livestream camera feed",
	chrome = "interactive",
	className,
}: LivestreamPlayerProps) {
	const resolvedAvailability = useMemo(() => {
		return availability ?? resolvePlaybackAvailabilityFromEnv();
	}, [availability]);

	if (env.VITE_DESIGN_TIME) {
		return <MockLivestreamPlayer alt={alt} className={className} />;
	}

	return <RealLivestreamPlayer availability={resolvedAvailability} chrome={chrome} className={className} />;
}
