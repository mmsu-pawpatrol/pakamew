import { createInitialStreamState, streamReducer } from "./reducer";
import { createStreamTransport } from "./transport";
import type { StreamCommand, StreamConnectionStatus, StreamEvent, StreamState } from "./types";

const STALL_TIMEOUT_MS = 5000;
const STALL_POLL_INTERVAL_MS = 1000;

type StatusListener = () => void;

export interface LivestreamRuntime {
	status: () => StreamConnectionStatus;
	subscribe: (listener: StatusListener) => () => void;
	mount: (img: HTMLImageElement) => () => void;
	retry: () => void;
	dispose: () => void;
}

function subscribeListener(listeners: Set<StatusListener>, listener: StatusListener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

function notifyListeners(listeners: Set<StatusListener>) {
	for (const listener of listeners) listener();
}

function syncImage(image: HTMLImageElement | null, state: StreamState, frameUrl: string | null) {
	if (!image) return;

	if (state.status !== "live" || !frameUrl) {
		image.hidden = true;
		image.removeAttribute("src");
		return;
	}

	image.hidden = false;
	if (image.getAttribute("src") !== frameUrl) {
		image.src = frameUrl;
	}
}

export function createLivestream(url: string): LivestreamRuntime {
	let state = createInitialStreamState();
	let currentFrameUrl: string | null = null;
	let mountedImage: HTMLImageElement | null = null;
	let lastFrameAt: number | null = null;
	let isDisposed = false;
	let hasStarted = false;
	let stallIntervalId: number | null = null;

	const listeners = new Set<StatusListener>();
	const transport = createStreamTransport(url, dispatch);

	function run(command: StreamCommand) {
		transport.run(command);
	}

	function dispatch(event: StreamEvent) {
		if (isDisposed) {
			return;
		}

		if (event.type === "frame-ready") {
			lastFrameAt = Date.now();

			if (currentFrameUrl && currentFrameUrl !== event.frameUrl) {
				run({ type: "revoke-frame-url", frameUrl: currentFrameUrl });
			}

			currentFrameUrl = event.frameUrl;
			syncImage(mountedImage, state, currentFrameUrl);
		}

		const previousState = state;
		const result = streamReducer(state, event);

		if (result.state !== previousState) {
			state = result.state;
			syncImage(mountedImage, state, currentFrameUrl);
			notifyListeners(listeners);
		}

		for (const command of result.commands) {
			run(command);
		}
	}

	function start() {
		if (hasStarted || isDisposed) return;

		hasStarted = true;
		run({ type: "connect" });

		stallIntervalId = window.setInterval(() => {
			if (state.status !== "live" || !lastFrameAt) return;

			const elapsedMs = Date.now() - lastFrameAt;
			if (elapsedMs <= STALL_TIMEOUT_MS) return;

			lastFrameAt = null;
			dispatch({ type: "frame-stalled" });
		}, STALL_POLL_INTERVAL_MS);
	}

	return {
		status: () => {
			return state.status;
		},
		subscribe: (listener) => {
			return subscribeListener(listeners, listener);
		},
		mount: (img) => {
			mountedImage = img;
			syncImage(mountedImage, state, currentFrameUrl);
			start();

			return () => {
				if (mountedImage === img) {
					syncImage(img, { status: "connecting" }, null);
					mountedImage = null;
				}
			};
		},
		retry: () => {
			if (isDisposed) return;

			if (!hasStarted) {
				start();
				return;
			}

			lastFrameAt = null;
			dispatch({ type: "retry-requested" });
		},
		dispose: () => {
			if (isDisposed) return;

			isDisposed = true;
			mountedImage = null;

			if (stallIntervalId !== null) {
				window.clearInterval(stallIntervalId);
				stallIntervalId = null;
			}

			transport.dispose(currentFrameUrl);
			currentFrameUrl = null;
			lastFrameAt = null;
			listeners.clear();
		},
	};
}
