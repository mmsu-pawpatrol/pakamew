import { Badge } from "@/components/ui/badge";
import { RadioIcon } from "lucide-react";

export function LiveBadge() {
	return (
		<Badge
			variant="destructive"
			className="bg-destructive h-6 gap-1.5 border-black/10 px-2.5 font-semibold text-white uppercase shadow-sm dark:border-white/15">
			<RadioIcon data-icon="inline-start" className="motion-safe:animate-pulse motion-reduce:animate-none" />
			<span>Live</span>
		</Badge>
	);
}
