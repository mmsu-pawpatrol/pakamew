import { Badge } from "@/components/ui/badge";
import { HlsPlayer } from "@/lib/hls";
import { useMemo } from "react";
import { readDvrWindowState } from "./shared/live-edge";
import { formatClock, formatDriftClock } from "./shared/time-format";

export function DriftTimer() {
	const currentTime = HlsPlayer.usePlayer((state) => state.currentTime);
	const seekable = HlsPlayer.usePlayer((state) => state.seekable);
	const dvrWindowState = useMemo(() => readDvrWindowState(currentTime, seekable), [currentTime, seekable]);

	return (
		<Badge
			variant="secondary"
			className="h-6 rounded-sm bg-black/33 px-2 text-xs font-medium text-white tabular-nums shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
			{formatClock(dvrWindowState.windowDuration)} / {formatDriftClock(dvrWindowState.drift)}
		</Badge>
	);
}
