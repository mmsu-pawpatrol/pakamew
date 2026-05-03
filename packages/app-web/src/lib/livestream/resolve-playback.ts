import { env } from "@/env";
import type { PlaybackAvailability, PlaybackSource } from "./types";

export function resolvePlaybackAvailabilityFromEnv(): PlaybackAvailability {
	const sources: PlaybackSource[] = [];

	if (env.VITE_LIVESTREAM_PUBLIC_HLS_URL) {
		sources.push({ kind: "hls", url: env.VITE_LIVESTREAM_PUBLIC_HLS_URL });
	}
	if (env.VITE_LIVESTREAM_GATEWAY_WS_URL) {
		sources.push({ kind: "websocket", url: env.VITE_LIVESTREAM_GATEWAY_WS_URL });
	}

	return { sources };
}
