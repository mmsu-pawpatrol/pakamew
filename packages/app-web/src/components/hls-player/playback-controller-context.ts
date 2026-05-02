import { createContext, use } from "react";
import type { DvrWindowState } from "./shared/live-edge";

export interface PlaybackControllerValue {
	canGoLive: boolean;
	dvrWindowState: DvrWindowState;
	isPaused: boolean;
	isRealtime: boolean;
	goLive: () => void;
	seekTimelinePosition: (position: number) => void;
	togglePlayback: () => void;
}

export const PlaybackControllerContext = createContext<PlaybackControllerValue | null>(null);

export function usePlaybackController() {
	const context = use(PlaybackControllerContext);

	if (!context) {
		throw new Error("usePlaybackController must be used within PlaybackControllerProvider.");
	}

	return context;
}
