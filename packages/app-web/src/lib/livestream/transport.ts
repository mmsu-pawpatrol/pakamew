import type { LivestreamCommand, LivestreamEvent, LivestreamFrameByUrl } from "./types";

interface LivestreamTransportContext {
	socketRef: {
		current: WebSocket | null;
	};
	dispatch: (event: LivestreamEvent) => void;
}

type LivestreamCommandHandlerMap = {
	[CommandType in LivestreamCommand["type"]]: (
		context: LivestreamTransportContext,
		command: Extract<LivestreamCommand, { type: CommandType }>,
	) => void;
};

export interface LivestreamTransport {
	run: (command: LivestreamCommand) => void;
	dispose: (frameBySourceUrl: LivestreamFrameByUrl) => void;
}

function clearSocketListeners(socket: WebSocket) {
	socket.onopen = null;
	socket.onmessage = null;
	socket.onerror = null;
	socket.onclose = null;
}

function closeCurrentSocket(context: LivestreamTransportContext, shouldSilenceSocketEvents = false) {
	const socket = context.socketRef.current;

	if (!socket) return;

	context.socketRef.current = null;

	if (shouldSilenceSocketEvents) clearSocketListeners(socket);

	socket.close();
}

function revokeFrameUrls(frameBySourceUrl: LivestreamFrameByUrl) {
	for (const frameUrl of Object.values(frameBySourceUrl)) {
		URL.revokeObjectURL(frameUrl);
	}
}

const handlers = {
	"connect": (context, command) => {
		closeCurrentSocket(context);

		const sourceUrl = command.url;
		const socket = new WebSocket(sourceUrl);
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
				sourceUrl,
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
	},

	"disconnect": (context) => {
		closeCurrentSocket(context);
	},

	"revoke-frame-url": (_context, command) => {
		URL.revokeObjectURL(command.frameUrl);
	},
} satisfies LivestreamCommandHandlerMap;

export function createLivestreamTransport(dispatch: (event: LivestreamEvent) => void): LivestreamTransport {
	const context: LivestreamTransportContext = {
		socketRef: { current: null },
		dispatch: dispatch,
	};

	return {
		run: (command) => {
			const handler = handlers[command.type] as (
				context: LivestreamTransportContext,
				command: LivestreamCommand,
			) => void;

			handler(context, command);
		},
		dispose: (frameBySourceUrl) => {
			closeCurrentSocket(context, true);
			revokeFrameUrls(frameBySourceUrl);
		},
	};
}
