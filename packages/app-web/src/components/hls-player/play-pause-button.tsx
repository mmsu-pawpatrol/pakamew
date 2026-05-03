import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PauseIcon, PlayIcon } from "lucide-react";
import { usePlaybackController } from "./playback-controller-context";

export function PlayPauseButton() {
	const { isPaused, togglePlayback } = usePlaybackController();

	return (
		<button
			type="button"
			onClick={togglePlayback}
			className={cn(
				buttonVariants({ variant: "ghost", size: "icon-sm" }),
				"rounded-full border border-transparent bg-transparent text-white shadow-none hover:bg-transparent hover:text-white",
			)}>
			{isPaused ? (
				<PlayIcon data-icon="inline-start" className="fill-current drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]" />
			) : (
				<PauseIcon data-icon="inline-start" className="fill-current drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]" />
			)}
		</button>
	);
}
