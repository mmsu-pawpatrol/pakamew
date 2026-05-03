import { Controls } from "@videojs/react";
import { Dock } from "./dock";
import { Timeline } from "./timeline";

function BottomControls() {
	return (
		<Controls.Root className="group/controls pointer-events-none absolute inset-0 z-20 opacity-100">
			<div className="pointer-events-auto absolute inset-x-3 bottom-3 sm:inset-x-4">
				<Timeline />
			</div>
			<Controls.Group
				aria-label="Livestream playback controls"
				className="pointer-events-auto absolute inset-x-3 bottom-6 flex items-end justify-between gap-3 opacity-88 transition-opacity duration-200 group-data-visible/controls:opacity-100 sm:inset-x-4">
				<Dock />
			</Controls.Group>
		</Controls.Root>
	);
}

export function ControlsOverlay() {
	return <BottomControls />;
}
