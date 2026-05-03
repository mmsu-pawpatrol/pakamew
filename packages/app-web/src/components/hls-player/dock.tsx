import { DriftTimer } from "./drift-timer";
import { LiveEdgeButton } from "./live-edge-button";
import { PlayPauseButton } from "./play-pause-button";

export function Dock() {
	return (
		<div className="flex w-full items-center gap-3">
			<div className="flex min-w-0 flex-1 items-center gap-2.5">
				<PlayPauseButton />
				<DriftTimer />
			</div>
			<div className="ml-auto shrink-0">
				<LiveEdgeButton />
			</div>
		</div>
	);
}
