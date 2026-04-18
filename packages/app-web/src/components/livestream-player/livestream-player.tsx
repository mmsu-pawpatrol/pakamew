import { env } from "@/env";
import { createLivestream } from "@/lib/livestream/create-livestream";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { LiveBadge } from "./live-badge";
import { LivestreamStatusOverlay } from "./status-overlay";

export interface LivestreamPlayerProps {
	url?: string;
	alt?: string;
	className?: string;
}

function LiveLivestreamPlayer({
	url,
	alt,
	className,
}: Required<Pick<LivestreamPlayerProps, "url" | "alt">> & Pick<LivestreamPlayerProps, "className">) {
	const runtime = useMemo(() => {
		return createLivestream(url);
	}, [url]);
	const imageRef = useRef<HTMLImageElement>(null);
	const status = useSyncExternalStore(runtime.subscribe, runtime.status, runtime.status);
	const frameClassName = cn("relative h-full w-full overflow-hidden", className);

	useEffect(() => {
		const image = imageRef.current;
		if (!image) {
			return;
		}

		const unmount = runtime.mount(image);
		return () => {
			unmount();
			runtime.dispose();
		};
	}, [runtime]);

	const shouldShowLive = status === "live";
	const overlayMode = shouldShowLive ? null : status;

	return (
		<div className="relative h-full w-full">
			<div className={frameClassName}>
				<img ref={imageRef} alt={alt} className="h-full w-full object-cover" hidden />
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
							overlayMode === "offline" || overlayMode === "error" || overlayMode === "connected"
								? runtime.retry
								: undefined
						}
					/>
				)}
			</div>
		</div>
	);
}

function DesignTimeLivestreamPlayer({
	alt,
	className,
}: Required<Pick<LivestreamPlayerProps, "alt">> & Pick<LivestreamPlayerProps, "className">) {
	const frameClassName = cn("relative h-full w-full overflow-hidden", className);

	return (
		<div className="relative h-full w-full">
			<div className={frameClassName}>
				<img src="/mr-fresh.jpg" alt={alt} className="h-full w-full object-cover" />
				<div className="absolute top-3 left-3 z-20">
					<LiveBadge />
				</div>
			</div>
		</div>
	);
}

export function LivestreamPlayer({
	url = env.VITE_LIVESTREAM_URL,
	alt = "Livestream camera feed",
	className,
}: LivestreamPlayerProps) {
	if (env.VITE_DESIGN_TIME) {
		return <DesignTimeLivestreamPlayer alt={alt} className={className} />;
	}

	return <LiveLivestreamPlayer url={url} alt={alt} className={className} />;
}
