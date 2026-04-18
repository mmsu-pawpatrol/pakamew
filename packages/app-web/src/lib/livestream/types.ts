export type StreamConnectionStatus = "connecting" | "connected" | "live" | "offline" | "error";

export interface StreamState {
	status: StreamConnectionStatus;
}

export type StreamCommand =
	| {
			type: "connect";
	  }
	| {
			type: "disconnect";
	  }
	| {
			type: "revoke-frame-url";
			frameUrl: string;
	  };

export type StreamEvent =
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
			frameUrl: string;
	  };

export interface StreamReducerResult {
	state: StreamState;
	commands: StreamCommand[];
}
