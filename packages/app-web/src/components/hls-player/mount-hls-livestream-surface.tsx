import type { HlsPlaybackSource, PlaybackChrome, PlayerStatus } from "@/lib/livestream/types";
import { createRoot } from "react-dom/client";
import { HlsLivestreamSurface } from "./hls-livestream-surface";

export interface MountHlsLivestreamSurfaceOptions {
	chrome: PlaybackChrome;
	className?: string;
	source: HlsPlaybackSource;
	onStatusChange: (status: PlayerStatus) => void;
}

export function mountHlsLivestreamSurface(target: HTMLElement, options: MountHlsLivestreamSurfaceOptions) {
	const root = createRoot(target);

	root.render(
		<HlsLivestreamSurface
			chrome={options.chrome}
			className={options.className}
			source={options.source}
			onStatusChange={options.onStatusChange}
		/>,
	);

	return () => {
		root.unmount();
	};
}
