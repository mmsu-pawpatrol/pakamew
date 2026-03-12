import type { LivestreamCommand, LivestreamEvent, LivestreamReducerResult, LivestreamState } from "./types";

type LivestreamEventHandlerMap = {
	[EventType in LivestreamEvent["type"]]: (
		state: LivestreamState,
		event: Extract<LivestreamEvent, { type: EventType }>,
	) => LivestreamReducerResult;
};

function withState(state: LivestreamState, commands: LivestreamCommand[] = []): LivestreamReducerResult {
	return {
		state,
		commands,
	};
}

function connect(state: LivestreamState, sourceUrl: string): LivestreamReducerResult {
	const commands: LivestreamCommand[] = [];
	const shouldSwitchSource = sourceUrl !== state.url;

	if (shouldSwitchSource) {
		commands.push({ type: "disconnect" });
	}

	commands.push({ type: "connect", url: sourceUrl });

	return withState(
		{
			...state,
			url: sourceUrl,
			status: "connecting",
		},
		commands,
	);
}

const handlers = {
	"source-url-set": (state, event) => {
		return connect(state, event.url);
	},
	"retry-requested": (state) => {
		return withState(
			{
				...state,
				status: "connecting",
			},
			[{ type: "disconnect" }, { type: "connect", url: state.url }],
		);
	},
	"frame-stalled": (state) => {
		if (state.status !== "live") return withState(state);
		return withState({
			...state,
			status: "connected",
		});
	},
	"socket-opened": (state) => {
		return withState({
			...state,
			status: "connected",
		});
	},
	"socket-errored": (state) => {
		return withState({
			...state,
			status: "error",
		});
	},
	"socket-closed": (state) => {
		return withState({
			...state,
			status: state.status === "error" ? "error" : "offline",
		});
	},
	"frame-ready": (state, event) => {
		const previousFrameUrl = state.frames[event.sourceUrl];

		return withState(
			{
				...state,
				status: "live",
				frames: {
					...state.frames,
					[event.sourceUrl]: event.frameUrl,
				},
			},
			previousFrameUrl && previousFrameUrl !== event.frameUrl
				? [{ type: "revoke-frame-url", frameUrl: previousFrameUrl }]
				: [],
		);
	},
} satisfies LivestreamEventHandlerMap;

export function createInitialLivestreamState(sourceUrl: string): LivestreamState {
	return {
		url: sourceUrl,
		status: "connecting",
		frames: {},
	};
}

export function reduceLivestream(state: LivestreamState, event: LivestreamEvent): LivestreamReducerResult {
	const handler = handlers[event.type] as (state: LivestreamState, event: LivestreamEvent) => LivestreamReducerResult;

	return handler(state, event);
}
