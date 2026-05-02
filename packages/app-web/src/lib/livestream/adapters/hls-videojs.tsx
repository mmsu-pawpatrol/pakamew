import { mountHlsLivestreamSurface } from "@/components/hls-player";
import type {
	HlsPlaybackSource,
	PlaybackAdapter,
	PlaybackAdapterSnapshot,
	PlaybackChrome,
	PlayerStatus,
} from "../types";

function canRetry(status: PlayerStatus) {
	return status === "offline" || status === "error";
}

function sameSnapshot(left: PlaybackAdapterSnapshot, right: PlaybackAdapterSnapshot) {
	return left.status === right.status && left.canRetry === right.canRetry;
}

function createSnapshot(status: PlayerStatus): PlaybackAdapterSnapshot {
	return {
		status,
		canRetry: canRetry(status),
	};
}

interface CreateHlsVideoJsAdapterOptions {
	chrome: PlaybackChrome;
}

export function createHlsVideoJsAdapter(
	source: HlsPlaybackSource,
	{ chrome }: CreateHlsVideoJsAdapterOptions,
): PlaybackAdapter {
	let isDisposed = false;
	let mountedCleanup: (() => void) | null = null;
	let mountedOptions: { className?: string } | undefined;
	let mountedTarget: HTMLElement | null = null;

	const listeners = new Set<() => void>();

	function notifyListeners() {
		for (const listener of listeners) listener();
	}

	function setStatus(status: PlayerStatus) {
		if (isDisposed) return;

		const nextSnapshot =
			status === "connecting" && snapshot.status === "live" ? createSnapshot("live") : createSnapshot(status);

		if (sameSnapshot(snapshot, nextSnapshot)) return;

		snapshot = nextSnapshot;
		notifyListeners();
	}

	let snapshot = createSnapshot("connecting");

	function resetSurface(status: PlayerStatus) {
		const nextSnapshot = createSnapshot(status);

		if (sameSnapshot(snapshot, nextSnapshot)) {
			return;
		}

		snapshot = nextSnapshot;
		notifyListeners();
	}

	function unmountSurface() {
		mountedCleanup?.();
		mountedCleanup = null;
	}

	function mountSurface() {
		if (!mountedTarget || isDisposed) {
			return;
		}

		unmountSurface();
		mountedCleanup = mountHlsLivestreamSurface(mountedTarget, {
			chrome,
			className: mountedOptions?.className,
			source,
			onStatusChange: setStatus,
		});
	}

	return {
		mount: (target, options) => {
			if (isDisposed) return () => undefined;

			mountedTarget = target;
			mountedOptions = options;
			mountSurface();

			return () => {
				if (mountedTarget !== target) return;

				unmountSurface();
				mountedOptions = undefined;
				mountedTarget = null;
			};
		},
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		snapshot: () => snapshot,
		retry: () => {
			if (isDisposed) return;

			resetSurface("connecting");
			mountSurface();
		},
		dispose: () => {
			if (isDisposed) return;

			isDisposed = true;
			unmountSurface();
			mountedOptions = undefined;
			mountedTarget = null;
			listeners.clear();
		},
	};
}
