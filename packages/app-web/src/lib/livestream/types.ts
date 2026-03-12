export type LivestreamConnectionStatus = "connecting" | "connected" | "live" | "offline" | "error";

export type LivestreamFrameByUrl = Record<string, string>;

export interface LivestreamState {
	url: string;
	status: LivestreamConnectionStatus;
	frames: LivestreamFrameByUrl;
}

export type LivestreamCommand =
	| {
			type: "connect";
			url: string;
	  }
	| {
			type: "disconnect";
	  }
	| {
			type: "revoke-frame-url";
			frameUrl: string;
	  };

export type LivestreamEvent =
	| {
			type: "source-url-set";
			url: string;
	  }
	| {
			type: "retry-requested";
	  }
	| {
			type: "frame-stalled";
	  }
	| {
			type: "socket-opened";
	  }
	| {
			type: "socket-errored";
	  }
	| {
			type: "socket-closed";
	  }
	| {
			type: "frame-ready";
			sourceUrl: string;
			frameUrl: string;
	  };

export interface LivestreamReducerResult {
	state: LivestreamState;
	commands: LivestreamCommand[];
}
