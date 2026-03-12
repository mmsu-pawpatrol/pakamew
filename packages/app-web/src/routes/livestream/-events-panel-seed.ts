export interface FeedingStationEventItem {
	id: string;
	title: string;
	description: string;
	time: string;
}

export const FEEDING_STATION_EVENTS: FeedingStationEventItem[] = [
	{
		id: "event-1",
		title: "Scheduled Feed Dispensed",
		description: "The morning scheduled feed was dispensed automatically.",
		time: "2:01 PM",
	},
	{
		id: "event-2",
		title: "Viewer Feed Triggered",
		description: "A viewer donation triggered one feed portion.",
		time: "2:03 PM",
	},
	{
		id: "event-3",
		title: "Viewer Feed Triggered",
		description: "Another viewer donation triggered one feed portion.",
		time: "2:05 PM",
	},
	{
		id: "event-4",
		title: "Low Kibble Alert",
		description: "The station reported that kibble level is running low.",
		time: "2:07 PM",
	},
	{
		id: "event-5",
		title: "Kibble Restocked",
		description: "Staff refilled kibble storage to keep feedings uninterrupted.",
		time: "2:09 PM",
	},
	{
		id: "event-6",
		title: "Station Cleaned",
		description: "The feeding station surfaces were cleaned and sanitized.",
		time: "2:12 PM",
	},
	{
		id: "event-7",
		title: "Kibble Jam Cleared",
		description: "A brief kibble jam was fixed and normal feeding resumed.",
		time: "2:14 PM",
	},
	{
		id: "event-8",
		title: "Portion Settings Updated",
		description: "Default feed portion size was updated for better accuracy.",
		time: "2:16 PM",
	},
	{
		id: "event-9",
		title: "Livestream Offline",
		description: "The camera feed briefly disconnected due to a network issue.",
		time: "2:18 PM",
	},
	{
		id: "event-10",
		title: "Livestream Restored",
		description: "The video feed is live again after connection recovery.",
		time: "2:22 PM",
	},
	{
		id: "event-11",
		title: "Feed Queue Synced",
		description: "Pending feed requests were synced and are being processed normally.",
		time: "2:24 PM",
	},
	{
		id: "event-12",
		title: "Viewer Feed Triggered",
		description: "A viewer donation triggered one feed portion.",
		time: "2:26 PM",
	},
	{
		id: "event-13",
		title: "Kibble Restocked",
		description: "Additional kibble was added from reserve stock.",
		time: "2:28 PM",
	},
	{
		id: "event-14",
		title: "Scheduled Feed Dispensed",
		description: "The evening scheduled feed was dispensed automatically.",
		time: "2:31 PM",
	},
	{
		id: "event-15",
		title: "Maintenance Started",
		description: "Feeding was briefly paused for routine equipment checks.",
		time: "2:33 PM",
	},
	{
		id: "event-16",
		title: "Maintenance Completed",
		description: "Checks were completed and the station is back online.",
		time: "2:36 PM",
	},
	{
		id: "event-17",
		title: "Viewer Feed Triggered",
		description: "A viewer donation triggered one feed portion.",
		time: "2:38 PM",
	},
	{
		id: "event-18",
		title: "Viewer Feed Triggered",
		description: "A queued donation was delivered after the stream recovered.",
		time: "2:40 PM",
	},
	{
		id: "event-19",
		title: "Safety Check Passed",
		description: "Equipment temperatures stayed in a safe range during operation.",
		time: "2:43 PM",
	},
	{
		id: "event-20",
		title: "Station Cleaned",
		description: "A final cleanup was completed after feed operations.",
		time: "2:45 PM",
	},
];

FEEDING_STATION_EVENTS.reverse();
