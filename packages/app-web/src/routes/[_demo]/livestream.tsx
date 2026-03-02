import { createFileRoute } from "@tanstack/react-router";
import { LivestreamPlayer } from "#/components/livestream-player";

export const Route = createFileRoute("/_demo/livestream")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div>
			<p> Livestream Player: </p>
			<LivestreamPlayer />
		</div>
	);
}
