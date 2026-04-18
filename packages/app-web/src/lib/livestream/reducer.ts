import type { StreamCommand, StreamEvent, StreamReducerResult, StreamState } from "./types";

function withState(state: StreamState, commands: StreamCommand[] = []): StreamReducerResult {
	return { state, commands };
}

export function createInitialStreamState(): StreamState {
	return { status: "connecting" };
}

export function streamReducer(state: StreamState, event: StreamEvent): StreamReducerResult {
	switch (event.type) {
		case "retry-requested":
			return withState({ ...state, status: "connecting" }, [{ type: "disconnect" }, { type: "connect" }]);
		case "frame-stalled":
			if (state.status !== "live") return withState(state);
			return withState({ ...state, status: "connected" });
		case "socket-opened":
			return withState({ ...state, status: "connected" });
		case "socket-errored":
			return withState({ ...state, status: "error" });
		case "socket-closed":
			return withState({ ...state, status: state.status === "error" ? "error" : "offline" });
		case "frame-ready":
			if (state.status === "live") return withState(state);
			return withState({ ...state, status: "live" });
	}
}
