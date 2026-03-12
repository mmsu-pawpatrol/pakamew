import { cn } from "@/lib/utils";

export interface LivestreamFrameShellProps {
	frameUrl: string | null;
	alt: string;
	className?: string;
	children?: React.ReactNode;
}

export function LivestreamFrameShell({ frameUrl, alt, className, children }: LivestreamFrameShellProps) {
	return (
		<div className={cn("relative h-full w-full overflow-hidden", className)}>
			{frameUrl ? <img src={frameUrl} alt={alt} className="h-full w-full object-cover" /> : null}
			{children}
		</div>
	);
}
