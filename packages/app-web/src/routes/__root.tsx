import { BottomNavbar } from "@/components/bottom-navbar";
import { cn } from "@/lib/utils";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

const ROOT_DEVTOOLS_CONFIG = {
	position: "bottom-right",
} as const;

const ROOT_DEVTOOLS_PLUGINS = [
	{
		name: "TanStack Router",
		render: <TanStackRouterDevtoolsPanel />,
	},
];

export const Route = createRootRoute({
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
});

function RootComponent() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	// Demo routes manage their own layout and should not render global bottom navigation.
	const isDemo = pathname.startsWith("/_demo");

	return (
		<>
			{/* Scrollable viewport for the active route content */}
			<div className={cn("h-dvh overflow-y-auto", !isDemo ? "pb-16 md:pb-19" : undefined)}>
				<Outlet />
			</div>

			{/* Persistent bottom navigation for non-demo routes */}
			{!isDemo ? <BottomNavbar pathname={pathname} /> : null}

			{/* Development tooling panels */}
			<TanStackDevtools config={ROOT_DEVTOOLS_CONFIG} plugins={ROOT_DEVTOOLS_PLUGINS} />
		</>
	);
}

function NotFoundComponent() {
	return <div>Not Found</div>;
}
