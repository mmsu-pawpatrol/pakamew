import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { HouseIcon, PawPrintIcon, UserRoundIcon } from "lucide-react";

/**
 * Props for the bottom navigation component.
 */
export interface BottomNavbarProps {
	pathname: string;
}

/**
 * Renders the persistent bottom navigation with a centered livestream shortcut.
 */
export function BottomNavbar({ pathname }: BottomNavbarProps) {
	const isHome = pathname === "/";
	const isProfile = pathname === "/profile";
	const isLivestream = pathname === "/livestream";
	// Heart-shaped SVG path used by the floating livestream action.
	const heartPath =
		"M10 17.55c-.86 0-1.64-.29-2.3-.88-1.24-1.1-2.43-2.21-3.6-3.33C1.56 10.92.35 9.13.35 6.42.35 3.14 2.72.78 5.72.78c1.8 0 3.36.83 4.28 2.3.92-1.47 2.48-2.3 4.28-2.3 3 0 5.37 2.36 5.37 5.64 0 2.71-1.21 4.5-3.75 6.92-1.17 1.12-2.36 2.23-3.6 3.33-.66.59-1.44.88-2.3.88Z";

	return (
		<nav className="bg-background/95 border-border fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur md:inset-x-auto md:bottom-5 md:left-1/2 md:w-auto md:-translate-x-1/2 md:rounded-2xl md:border md:shadow-lg">
			<div className="relative mx-auto h-16 w-full max-w-4xl px-4 md:h-14 md:w-auto md:max-w-none md:px-4">
				{/* Primary navigation actions */}
				<div className="grid h-full grid-cols-[1fr_auto_1fr] items-center">
					<div className="flex justify-center">
						<Button
							asChild
							variant={isHome ? "secondary" : "ghost"}
							size="sm"
							className="h-11 min-w-20 flex-col gap-1 rounded-xl">
							<Link to="/">
								<HouseIcon />
								<span className="text-[11px]">Home</span>
							</Link>
						</Button>
					</div>

					{/* Reserved center spacing for the floating livestream action */}
					<div aria-hidden className="w-28" />

					<div className="flex justify-center">
						<Button
							asChild
							variant={isProfile ? "secondary" : "ghost"}
							size="sm"
							className="h-11 min-w-20 flex-col gap-1 rounded-xl">
							<Link to="/profile">
								<UserRoundIcon />
								<span className="text-[11px]">Profile</span>
							</Link>
						</Button>
					</div>
				</div>

				{/* Floating center action for the livestream route */}
				<div className="pointer-events-none absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-[40%] md:-translate-y-[20%]">
					<Link
						to="/livestream"
						aria-label="Open livestream"
						className={cn(
							"text-foreground pointer-events-auto relative flex size-20 items-center justify-center overflow-visible transition-transform outline-none focus-visible:scale-[1.02] md:scale-[1.02] md:focus-visible:scale-[1.04]",
							isLivestream && "scale-[1.04] md:scale-[1.06]",
						)}>
						<svg
							aria-hidden="true"
							viewBox="0 0 20 18"
							className="absolute inset-0 size-full overflow-visible drop-shadow-lg/5"
							fill="none">
							<path
								d={heartPath}
								className={cn(isLivestream ? "fill-secondary stroke-border" : "fill-background stroke-border")}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="0.25"
							/>
						</svg>
						<PawPrintIcon className="relative z-10 size-7" />
					</Link>
				</div>
			</div>
		</nav>
	);
}
