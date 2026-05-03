import { cn } from "@/lib/utils";
import { HlsVideo } from "@videojs/react/media/hls-video";
import { useEffect, useEffectEvent, useRef, type ReactNode } from "react";
import { HlsPlayer } from "./player";

export type HlsPlayerStatus = "idle" | "connecting" | "live" | "offline" | "error";

export interface MediaSurfaceProps {
	children?: ReactNode;
	className?: string;
	sourceUrl: string;
	onStatusChange: (status: HlsPlayerStatus) => void;
}

export function MediaSurface({ children, className, sourceUrl, onStatusChange }: MediaSurfaceProps) {
	const mediaRef = useRef<HTMLVideoElement | null>(null);
	const setStatus = useEffectEvent(onStatusChange);

	useEffect(() => setStatus("connecting"), [sourceUrl]);

	useEffect(() => {
		const media = mediaRef.current;

		if (!media) {
			return;
		}

		const handleConnecting = () => setStatus("connecting");
		const handleLive = () => setStatus("live");
		const handleError = () => setStatus("error");

		media.addEventListener("loadeddata", handleLive);
		media.addEventListener("canplay", handleLive);
		media.addEventListener("playing", handleLive);
		media.addEventListener("waiting", handleConnecting);
		media.addEventListener("loadstart", handleConnecting);
		media.addEventListener("stalled", handleConnecting);
		media.addEventListener("suspend", handleConnecting);
		media.addEventListener("abort", handleConnecting);
		media.addEventListener("emptied", handleConnecting);
		media.addEventListener("ended", handleConnecting);
		media.addEventListener("error", handleError);

		void media.play().catch(() => void 0);

		return () => {
			media.removeEventListener("loadeddata", handleLive);
			media.removeEventListener("canplay", handleLive);
			media.removeEventListener("playing", handleLive);
			media.removeEventListener("waiting", handleConnecting);
			media.removeEventListener("loadstart", handleConnecting);
			media.removeEventListener("stalled", handleConnecting);
			media.removeEventListener("suspend", handleConnecting);
			media.removeEventListener("abort", handleConnecting);
			media.removeEventListener("emptied", handleConnecting);
			media.removeEventListener("ended", handleConnecting);
			media.removeEventListener("error", handleError);
		};
	}, [sourceUrl]);

	return (
		<HlsPlayer.Provider>
			<HlsPlayer.Container className={cn("relative size-full overflow-hidden bg-black", className)}>
				<HlsVideo
					ref={mediaRef}
					src={sourceUrl}
					preload="auto"
					autoPlay
					muted
					playsInline
					className="size-full bg-black object-cover"
				/>
				{children}
			</HlsPlayer.Container>
		</HlsPlayer.Provider>
	);
}
