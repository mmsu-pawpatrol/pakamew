import {
	createInitialWebsocketPlaybackState,
	websocketPlaybackReducer,
	type WebsocketPlaybackCommand,
	type WebsocketPlaybackEvent,
	type WebsocketPlaybackState,
} from "../reducer";
import { createWebsocketFrameTransport } from "../transport";
import type { PlaybackAdapter, PlaybackAdapterSnapshot, PlaybackSource } from "../types";

type WebsocketPlaybackSource = Extract<PlaybackSource, { kind: "websocket" }>;
const RESET_WEBSOCKET_PLAYBACK_STATE = createInitialWebsocketPlaybackState();

function sameSnapshot(left: PlaybackAdapterSnapshot, right: PlaybackAdapterSnapshot) {
	return left.status === right.status && left.canRetry === right.canRetry;
}

function toSnapshot(state: WebsocketPlaybackState): PlaybackAdapterSnapshot {
	return {
		status: state.status,
		canRetry: state.status === "offline" || state.status === "error",
	};
}

function syncImage(image: HTMLImageElement | null, state: WebsocketPlaybackState, frameUrl: string | null) {
	if (!image) return;

	if (state.status !== "live" || !frameUrl) {
		image.hidden = true;
		image.removeAttribute("src");
		return;
	}

	image.hidden = false;

	if (image.getAttribute("src") !== frameUrl) image.src = frameUrl;
}

function notifyListeners(listeners: Set<() => void>) {
	for (const listener of listeners) listener();
}

export function createWebsocketAdapter(source: WebsocketPlaybackSource): PlaybackAdapter {
	let state = createInitialWebsocketPlaybackState();
	let snapshot = toSnapshot(state);
	let mountedImage: HTMLImageElement | null = null;
	let mountedTarget: HTMLDivElement | null = null;
	let currentFrameUrl: string | null = null;
	let isDisposed = false;
	let hasStarted = false;

	const listeners = new Set<() => void>();
	const transport = createWebsocketFrameTransport(source.url, dispatch);

	function run(command: WebsocketPlaybackCommand) {
		transport.run(command);
	}

	function updateSnapshot() {
		const nextSnapshot = toSnapshot(state);

		if (sameSnapshot(snapshot, nextSnapshot)) return;

		snapshot = nextSnapshot;
		notifyListeners(listeners);
	}

	function cleanupMountedSurface() {
		const target = mountedTarget;
		const image = mountedImage;

		if (!target) {
			return;
		}

		if (image) {
			syncImage(image, RESET_WEBSOCKET_PLAYBACK_STATE, null);
		}

		target.replaceChildren();
		mountedTarget = null;
		mountedImage = null;
	}

	function dispatch(event: WebsocketPlaybackEvent) {
		if (isDisposed) return;

		if (event.type === "frame-ready") {
			if (currentFrameUrl && currentFrameUrl !== event.frameUrl) {
				run({
					type: "revoke-frame-url",
					frameUrl: currentFrameUrl,
				});
			}

			currentFrameUrl = event.frameUrl;
		}

		const result = websocketPlaybackReducer(state, event);
		state = result.state;
		syncImage(mountedImage, state, currentFrameUrl);
		updateSnapshot();

		for (const command of result.commands) {
			run(command);
		}
	}

	function start() {
		if (hasStarted || isDisposed) return;

		hasStarted = true;
		run({ type: "connect" });
	}

	function mountSurface(target: HTMLDivElement) {
		if (isDisposed) {
			return;
		}

		if (mountedTarget === target) {
			syncImage(mountedImage, state, currentFrameUrl);
			start();
			return;
		}

		cleanupMountedSurface();

		const image = document.createElement("img");
		image.alt = "";
		image.className = "size-full bg-black object-cover";
		image.hidden = true;
		target.replaceChildren(image);

		mountedTarget = target;
		mountedImage = image;
		syncImage(mountedImage, state, currentFrameUrl);
		start();
	}

	return {
		mount: (target) => {
			if (isDisposed) return () => undefined;

			mountSurface(target as HTMLDivElement);

			return () => {
				if (mountedTarget !== target) return;

				cleanupMountedSurface();
			};
		},
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		snapshot: () => snapshot,
		retry: () => {
			if (isDisposed) return;

			if (!hasStarted) {
				start();
				return;
			}

			dispatch({ type: "retry-requested" });
		},
		dispose: () => {
			if (isDisposed) return;

			isDisposed = true;
			cleanupMountedSurface();
			transport.dispose(currentFrameUrl);
			currentFrameUrl = null;
			listeners.clear();
		},
	};
}
