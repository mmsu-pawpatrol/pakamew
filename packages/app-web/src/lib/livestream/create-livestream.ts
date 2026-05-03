import { createHlsVideoJsAdapter } from "./adapters/hls-videojs";
import { createWebsocketAdapter } from "./adapters/websocket";
import type {
	LivestreamRuntime,
	PlaybackAdapter,
	PlaybackAvailability,
	PlaybackChrome,
	PlaybackRuntimeSnapshot,
	PlaybackSource,
	PlaybackSourceKind,
} from "./types";

function sameSnapshot(left: PlaybackRuntimeSnapshot, right: PlaybackRuntimeSnapshot) {
	return (
		left.status === right.status &&
		left.targetSourceKind === right.targetSourceKind &&
		left.sourceKind === right.sourceKind &&
		left.sources === right.sources &&
		left.canRetry === right.canRetry
	);
}

function notifyListeners(listeners: Set<() => void>) {
	for (const listener of listeners) listener();
}

function findSource(sources: PlaybackSource[], kind: PlaybackSourceKind | null) {
	if (!kind) return null;

	return sources.find((source) => source.kind === kind) ?? null;
}

function selectInitialSourceKind(sources: PlaybackSource[]) {
	return sources[0]?.kind ?? null;
}

interface CreateLivestreamOptions {
	chrome?: PlaybackChrome;
}

function createAdapter(source: PlaybackSource, chrome: PlaybackChrome): PlaybackAdapter {
	switch (source.kind) {
		case "hls":
			return createHlsVideoJsAdapter(source, { chrome });
		case "websocket":
			return createWebsocketAdapter(source);
	}
}

export function createLivestream(
	availability: PlaybackAvailability,
	{ chrome = "interactive" }: CreateLivestreamOptions = {},
): LivestreamRuntime {
	let isDisposed = false;
	let mountedCleanup: (() => void) | null = null;
	let mountedOptions: { className?: string } | undefined;
	let mountedTarget: HTMLElement | null = null;
	let activeAdapter: PlaybackAdapter | null = null;
	let activeAdapterUnsubscribe: (() => void) | null = null;
	let effectiveSourceKind: PlaybackSourceKind | null = null;
	let requestedSourceKind: PlaybackSourceKind | null = selectInitialSourceKind(availability.sources);
	const listeners = new Set<() => void>();
	let runtimeSnapshot: PlaybackRuntimeSnapshot = {
		status: requestedSourceKind ? "idle" : "offline",
		targetSourceKind: requestedSourceKind,
		sourceKind: effectiveSourceKind,
		sources: availability.sources,
		canRetry: false,
	};

	function refreshSnapshot() {
		const adapterSnapshot = activeAdapter?.snapshot();
		const nextSnapshot: PlaybackRuntimeSnapshot = {
			status: adapterSnapshot?.status ?? (requestedSourceKind ? "idle" : "offline"),
			targetSourceKind: requestedSourceKind,
			sourceKind: effectiveSourceKind,
			sources: availability.sources,
			canRetry: adapterSnapshot?.canRetry ?? false,
		};

		if (sameSnapshot(runtimeSnapshot, nextSnapshot)) return false;

		runtimeSnapshot = nextSnapshot;
		return true;
	}

	function emitChange() {
		if (refreshSnapshot()) notifyListeners(listeners);
	}

	function mountActiveAdapter() {
		if (!activeAdapter || !mountedTarget) {
			return;
		}

		mountedCleanup = activeAdapter.mount(mountedTarget, mountedOptions);
	}

	function teardownActiveAdapter() {
		mountedCleanup?.();
		mountedCleanup = null;

		activeAdapterUnsubscribe?.();
		activeAdapterUnsubscribe = null;

		activeAdapter?.dispose();
		activeAdapter = null;
		effectiveSourceKind = null;
	}

	function activateRequestedSource() {
		const nextSource =
			findSource(availability.sources, requestedSourceKind) ??
			findSource(availability.sources, selectInitialSourceKind(availability.sources));

		if (!nextSource) {
			requestedSourceKind = null;
			teardownActiveAdapter();
			emitChange();
			return;
		}

		requestedSourceKind = nextSource.kind;

		if (activeAdapter && effectiveSourceKind === nextSource.kind) {
			emitChange();
			return;
		}

		teardownActiveAdapter();

		activeAdapter = createAdapter(nextSource, chrome);
		effectiveSourceKind = nextSource.kind;
		activeAdapterUnsubscribe = activeAdapter.subscribe(() => {
			emitChange();
		});
		mountActiveAdapter();
		emitChange();
	}

	activateRequestedSource();

	return {
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		snapshot: () => runtimeSnapshot,
		mount: (target, options) => {
			if (isDisposed) return () => undefined;

			mountedCleanup?.();
			mountedCleanup = null;
			mountedOptions = options;
			mountedTarget = target;
			mountActiveAdapter();

			return () => {
				if (mountedTarget !== target) return;

				mountedCleanup?.();
				mountedCleanup = null;
				mountedOptions = undefined;
				mountedTarget = null;
			};
		},
		switch: (kind) => {
			if (isDisposed || !findSource(availability.sources, kind)) return;

			requestedSourceKind = kind;
			activateRequestedSource();
		},
		retry: () => {
			if (isDisposed) return;

			activeAdapter?.retry();
		},
		dispose: () => {
			if (isDisposed) return;

			isDisposed = true;
			teardownActiveAdapter();
			mountedOptions = undefined;
			mountedTarget = null;
			listeners.clear();
		},
	};
}
