import type { StreamCommand, StreamEvent } from "./types";

interface TransportContext {
	socketRef: {
		current: WebSocket | null;
	};
	dispatch: (event: StreamEvent) => void;
}

interface Transport {
	run: (command: StreamCommand) => void;
	dispose: (frameUrl: string | null) => void;
}

function clearSocketListeners(socket: WebSocket) {
	socket.onopen = null;
	socket.onmessage = null;
	socket.onerror = null;
	socket.onclose = null;
}

function closeCurrentSocket(context: TransportContext, shouldSilenceSocketEvents = false) {
	const socket = context.socketRef.current;

	if (!socket) return;

	context.socketRef.current = null;

	if (shouldSilenceSocketEvents) clearSocketListeners(socket);

	socket.close();
}

function revokeFrameUrl(frameUrl: string | null) {
	if (frameUrl) {
		URL.revokeObjectURL(frameUrl);
	}
}

export function createStreamTransport(url: string, dispatch: (event: StreamEvent) => void): Transport {
	const context: TransportContext = {
		socketRef: { current: null },
		dispatch: dispatch,
	};

	return {
		run: (command) => {
			switch (command.type) {
				case "connect": {
					closeCurrentSocket(context);

					const socket = new WebSocket(url);
					socket.binaryType = "blob";
					context.socketRef.current = socket;

					socket.onopen = () => {
						if (context.socketRef.current !== socket) return;
						context.dispatch({ type: "socket-opened" });
					};

					socket.onmessage = (event) => {
						if (context.socketRef.current !== socket || !(event.data instanceof Blob)) return;

						const frameUrl = URL.createObjectURL(event.data);
						context.dispatch({
							type: "frame-ready",
							frameUrl,
						});
					};

					socket.onerror = () => {
						if (context.socketRef.current !== socket) return;
						context.dispatch({ type: "socket-errored" });
					};

					socket.onclose = () => {
						if (context.socketRef.current !== socket) return;
						context.socketRef.current = null;
						context.dispatch({ type: "socket-closed" });
					};
					return;
				}
				case "disconnect":
					closeCurrentSocket(context);
					return;
				case "revoke-frame-url":
					URL.revokeObjectURL(command.frameUrl);
					return;
			}
		},

		dispose: (frameUrl) => {
			closeCurrentSocket(context, true);
			revokeFrameUrl(frameUrl);
		},
	};
}
