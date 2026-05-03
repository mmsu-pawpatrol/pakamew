export const LIVE_EDGE_THRESHOLD_SECONDS = 2;

export interface LiveEdgeState {
	canSeekToLiveEdge: boolean;
	isAtLiveEdge: boolean;
}

export interface DvrWindowState extends LiveEdgeState {
	drift: number;
	end: number;
	hasWindow: boolean;
	position: number;
	start: number;
	windowDuration: number;
}

export function readLiveEdgeState(currentTime: number, seekable: readonly [number, number][]): LiveEdgeState {
	const lastSeekableRangeIndex = seekable.length - 1;

	if (lastSeekableRangeIndex < 0) {
		return {
			canSeekToLiveEdge: false,
			isAtLiveEdge: true,
		};
	}

	const liveEdge = seekable[lastSeekableRangeIndex]?.[1];

	if (!Number.isFinite(liveEdge)) {
		return {
			canSeekToLiveEdge: false,
			isAtLiveEdge: true,
		};
	}

	const distanceFromLiveEdge = liveEdge - currentTime;

	return {
		canSeekToLiveEdge: true,
		isAtLiveEdge: distanceFromLiveEdge <= LIVE_EDGE_THRESHOLD_SECONDS,
	};
}

export function readDvrWindowState(currentTime: number, seekable: readonly [number, number][]): DvrWindowState {
	const [start = Number.NaN, end = Number.NaN] = seekable.at(-1) ?? [];

	if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
		return {
			canSeekToLiveEdge: false,
			drift: 0,
			end: 0,
			hasWindow: false,
			isAtLiveEdge: true,
			position: 0,
			start: 0,
			windowDuration: 0,
		};
	}

	const liveEdgeState = readLiveEdgeState(currentTime, seekable);
	const clampedCurrentTime = Math.min(Math.max(currentTime, start), end);
	const position = clampedCurrentTime - start;
	const drift = Math.max(0, end - clampedCurrentTime);

	return {
		...liveEdgeState,
		drift,
		end,
		hasWindow: true,
		position,
		start,
		windowDuration: end - start,
	};
}
