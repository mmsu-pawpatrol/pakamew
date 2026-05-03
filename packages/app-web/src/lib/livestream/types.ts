export type PlaybackSourceKind = "hls" | "websocket";
export type PlaybackChrome = "interactive" | "badge";

export type PlaybackAvailabilityStatus = "live" | "offline" | "degraded" | "maintenance" | "disabled";

export type PlayerStatus = "idle" | "connecting" | "live" | "offline" | "error";

export type PlaybackSource = { kind: "hls"; url: string } | { kind: "websocket"; url: string };
export type HlsPlaybackSource = Extract<PlaybackSource, { kind: "hls" }>;

export interface PlaybackAvailability {
	livestreamId?: string;
	livestreamKey?: string;
	status?: PlaybackAvailabilityStatus;
	sources: PlaybackSource[];
}

export interface PlaybackAdapterSnapshot {
	status: PlayerStatus;
	canRetry: boolean;
}

export interface PlaybackRuntimeSnapshot {
	status: PlayerStatus;
	targetSourceKind: PlaybackSourceKind | null;
	sourceKind: PlaybackSourceKind | null;
	sources: PlaybackSource[];
	canRetry: boolean;
}

export interface PlaybackAdapter {
	mount: (target: HTMLElement, options?: { className?: string }) => () => void;
	subscribe: (listener: () => void) => () => void;
	snapshot: () => PlaybackAdapterSnapshot;
	retry: () => void;
	dispose: () => void;
}

export interface LivestreamRuntime {
	subscribe: (listener: () => void) => () => void;
	snapshot: () => PlaybackRuntimeSnapshot;
	mount: (target: HTMLElement, options?: { className?: string }) => () => void;
	switch: (kind: PlaybackSourceKind) => void;
	retry: () => void;
	dispose: () => void;
}
