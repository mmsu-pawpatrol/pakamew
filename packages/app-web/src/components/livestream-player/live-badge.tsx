import { Badge } from "@/components/ui/badge";
import { RadioIcon } from "lucide-react";

export interface LiveBadgeProps {
	live?: boolean;
}

export function LiveBadge({ live = true }: LiveBadgeProps) {
	return (
		<Badge
			variant={live ? "destructive" : "secondary"}
			className={
				live
					? "bg-destructive h-6 gap-1.5 border-black/10 px-2.5 font-semibold text-white uppercase shadow-sm dark:border-white/15"
					: "h-6 gap-1.5 border-black/10 bg-black/70 px-2.5 font-semibold text-white uppercase shadow-sm dark:border-white/15"
			}>
			<RadioIcon
				data-icon="inline-start"
				className={live ? "motion-safe:animate-pulse motion-reduce:animate-none" : "opacity-80"}
			/>
			<span>{live ? "Live" : "Offline"}</span>
		</Badge>
	);
}
