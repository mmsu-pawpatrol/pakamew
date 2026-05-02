import { MediaSurface, type HlsPlayerStatus } from "@/lib/hls";
import type { HlsPlaybackSource, PlaybackChrome, PlayerStatus } from "@/lib/livestream/types";
import { ControlsOverlay } from "./controls-overlay";
import { PlaybackControllerProvider } from "./playback-controller";

export interface HlsLivestreamSurfaceProps {
	chrome: PlaybackChrome;
	className?: string;
	source: HlsPlaybackSource;
	onStatusChange: (status: PlayerStatus) => void;
}

export function HlsLivestreamSurface({ chrome, className, source, onStatusChange }: HlsLivestreamSurfaceProps) {
	return (
		<MediaSurface
			className={className}
			sourceUrl={source.url}
			onStatusChange={(status: HlsPlayerStatus) => {
				onStatusChange(status);
			}}>
			<PlaybackControllerProvider>{chrome === "interactive" ? <ControlsOverlay /> : null}</PlaybackControllerProvider>
		</MediaSurface>
	);
}
