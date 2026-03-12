import { useLayoutEffect, useRef } from "react";
import { FEEDING_STATION_EVENTS } from "./-events-panel-seed";

export function EventsPanel() {
	const eventListRef = useRef<HTMLUListElement>(null);

	useLayoutEffect(() => {
		eventListRef.current?.scrollTo({ top: 0 });
	}, []);

	return (
		<section className="flex h-full min-h-0 flex-col overflow-hidden">
			<header className="shrink-0 border-b px-4 py-3">
				<p className="text-sm font-medium">Recent Feeding Station Events</p>
				<p className="text-muted-foreground mt-1 text-xs">
					Latest updates from dispensing, maintenance, and stream uptime.
				</p>
			</header>

			<ul ref={eventListRef} className="min-h-0 flex-1 divide-y overflow-y-auto pb-10 lg:pb-3">
				{FEEDING_STATION_EVENTS.map((event) => (
					<li key={event.id} className="px-4 py-3">
						<div className="mb-1 flex items-center justify-between gap-2">
							<p className="text-sm font-medium">{event.title}</p>
							<span className="text-muted-foreground text-xs">{event.time}</span>
						</div>
						<p className="text-muted-foreground text-sm">{event.description}</p>
					</li>
				))}
			</ul>
		</section>
	);
}
