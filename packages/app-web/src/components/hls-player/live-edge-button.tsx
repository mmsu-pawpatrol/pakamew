import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RadioIcon } from "lucide-react";
import { usePlaybackController } from "./playback-controller-context";

export function LiveEdgeButton() {
	const { canGoLive, goLive, isRealtime } = usePlaybackController();

	return (
		<Button
			type="button"
			size="xs"
			variant="ghost"
			className={cn(
				"h-6 rounded-sm bg-black/33 px-2 text-xs font-medium text-white shadow-sm hover:text-white disabled:opacity-100",
				!isRealtime && "bg-black/44 hover:bg-black/66",
			)}
			disabled={!canGoLive}
			onClick={goLive}>
			<RadioIcon data-icon="inline-start" className="text-white/82 drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]" />
			{isRealtime ? "Real-Time" : "Go Live"}
		</Button>
	);
}
