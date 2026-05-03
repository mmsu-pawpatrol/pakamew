import { createPlayer } from "@videojs/react";
import { videoFeatures } from "@videojs/react/video";

export const HlsPlayer = createPlayer({
	features: videoFeatures,
	displayName: "PakamewLivestreamHlsPlayer",
});
