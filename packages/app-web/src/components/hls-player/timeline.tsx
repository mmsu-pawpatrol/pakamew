import { Slider } from "@videojs/react";
import { usePlaybackController } from "./playback-controller-context";
import { formatDriftClock } from "./shared/time-format";

export function Timeline() {
	const { dvrWindowState, seekTimelinePosition } = usePlaybackController();
	const isInteractive = dvrWindowState.hasWindow && dvrWindowState.windowDuration > 0;

	return (
		<Slider.Root
			min={0}
			max={Math.max(dvrWindowState.windowDuration, 1)}
			step={0.1}
			largeStep={5}
			value={dvrWindowState.position}
			disabled={!isInteractive}
			thumbAlignment="edge"
			label={(state) =>
				`Seek livestream position, ${formatDriftClock(dvrWindowState.windowDuration - state.value)} drift from real-time`
			}
			onValueChange={(value) => {
				if (!isInteractive) {
					return;
				}

				seekTimelinePosition(value);
			}}
			className="group/timeline relative flex h-4 w-full cursor-pointer items-end opacity-72 transition-opacity duration-200 group-data-visible/controls:opacity-100">
			<Slider.Track className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-[#606060] transition-[background-color,height] duration-200 group-data-interactive/timeline:h-1.5 group-data-pointing/timeline:bg-[#707070]">
				<Slider.Fill className="absolute inset-y-0 left-0 w-(--media-slider-fill) rounded-full bg-[#ff0033] group-data-dragging/timeline:w-(--media-slider-pointer)" />
			</Slider.Track>
			<Slider.Thumb className="absolute bottom-0 left-(--media-slider-fill) size-3.5 -translate-x-1/2 translate-y-1/3 rounded-full border border-white/80 bg-[#ff0033] shadow-[0_1px_8px_rgba(0,0,0,0.45)] transition-transform duration-200 not-group-data-interactive/timeline:scale-0 group-data-dragging/timeline:left-(--media-slider-pointer) group-data-dragging/timeline:scale-110 group-data-interactive/timeline:scale-100" />
		</Slider.Root>
	);
}
