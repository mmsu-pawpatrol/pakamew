import type { PlayerStatus } from "./types";

export interface WebsocketPlaybackState {
	status: PlayerStatus;
	hasFrame: boolean;
}

export type WebsocketPlaybackCommand =
	| { type: "connect" }
	| { type: "disconnect" }
	| { type: "revoke-frame-url"; frameUrl: string };

export type WebsocketPlaybackEvent =
	| { type: "retry-requested" }
	| { type: "socket-opened" }
	| { type: "socket-errored" }
	| { type: "socket-closed" }
	| { type: "frame-ready"; frameUrl: string };

export interface WebsocketPlaybackReducerResult {
	state: WebsocketPlaybackState;
	commands: WebsocketPlaybackCommand[];
}

function withState(
	state: WebsocketPlaybackState,
	commands: WebsocketPlaybackCommand[] = [],
): WebsocketPlaybackReducerResult {
	return { state, commands };
}

export function createInitialWebsocketPlaybackState(): WebsocketPlaybackState {
	return { status: "connecting", hasFrame: false };
}

export function websocketPlaybackReducer(
	state: WebsocketPlaybackState,
	event: WebsocketPlaybackEvent,
): WebsocketPlaybackReducerResult {
	switch (event.type) {
		case "retry-requested":
			return withState({ status: "connecting", hasFrame: false }, [{ type: "disconnect" }, { type: "connect" }]);
		case "socket-opened":
			return withState({ ...state, status: state.hasFrame ? "live" : "connecting" });
		case "socket-errored":
			return withState({ ...state, status: "error" });
		case "socket-closed":
			return withState({ ...state, status: state.status === "error" ? "error" : "offline" });
		case "frame-ready":
			return withState({ status: "live", hasFrame: true });
	}
}
