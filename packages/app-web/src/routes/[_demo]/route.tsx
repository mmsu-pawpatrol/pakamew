import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_demo")({
	// beforeLoad() {
	// 	if (!import.meta.env.DEV && import.meta.env.MODE !== "development") {
	// 		// eslint-disable-next-line @typescript-eslint/only-throw-error
	// 		throw notFound();
	// 	}
	// },
	component: () => <Outlet />,
});
