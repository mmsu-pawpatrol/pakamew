const { performance } = require("node:perf_hooks");

function createWindowMetrics(nowMs) {
	return {
		startedAtMs: nowMs,
		duplicateFrames: 0,
		droppedFrames: 0,
		inputFrames: 0,
		outputFrames: 0,
	};
}

/**
 * Normalize bursty incoming JPEG frames into a fixed output cadence.
 *
 * @param {Object} options
 * @param {number} options.targetOutputFps
 * @param {number} options.jitterBufferMs
 * @param {number} options.maxPendingAgeMs
 * @param {number} options.sourceStaleTimeoutMs
 * @param {() => number} [options.nowMs]
 */
function createFramePacer(options) {
	const {
		targetOutputFps,
		jitterBufferMs,
		maxPendingAgeMs,
		sourceStaleTimeoutMs,
		nowMs = () => performance.now(),
	} = options;
	const frameIntervalMs = 1000 / targetOutputFps;
	const initialNowMs = nowMs();

	const state = {
		lastEmittedFrame: null,
		lastInputAtMs: null,
		pendingFrames: [],
		totalDuplicateFrames: 0,
		totalDroppedFrames: 0,
		totalInputFrames: 0,
		totalOutputFrames: 0,
		window: createWindowMetrics(initialNowMs),
	};

	function recordDrop(count) {
		if (count <= 0) return;
		state.totalDroppedFrames += count;
		state.window.droppedFrames += count;
	}

	function recordDuplicate() {
		state.totalDuplicateFrames += 1;
		state.window.duplicateFrames += 1;
	}

	function recordInput() {
		state.totalInputFrames += 1;
		state.window.inputFrames += 1;
	}

	function recordOutput() {
		state.totalOutputFrames += 1;
		state.window.outputFrames += 1;
	}

	function clearEmittedFrameWhenSourceIsStale(timestampMs) {
		if (state.lastInputAtMs == null) {
			state.lastEmittedFrame = null;
			return;
		}

		if (timestampMs - state.lastInputAtMs > sourceStaleTimeoutMs) {
			state.lastEmittedFrame = null;
		}
	}

	function getStatsSnapshot(timestampMs = nowMs()) {
		return {
			frameIntervalMs,
			jitterBufferMs,
			lastInputAgeMs: state.lastInputAtMs == null ? null : timestampMs - state.lastInputAtMs,
			maxPendingAgeMs,
			oldestPendingAgeMs:
				state.pendingFrames.length === 0 ? 0 : Math.max(0, timestampMs - state.pendingFrames[0].receivedAtMs),
			pendingFrames: state.pendingFrames.length,
			sourceStaleTimeoutMs,
			targetOutputFps,
			totalDuplicateFrames: state.totalDuplicateFrames,
			totalDroppedFrames: state.totalDroppedFrames,
			totalInputFrames: state.totalInputFrames,
			totalOutputFrames: state.totalOutputFrames,
		};
	}

	function drainWindowMetrics(timestampMs = nowMs()) {
		const elapsedMs = Math.max(1, timestampMs - state.window.startedAtMs);
		const snapshot = getStatsSnapshot(timestampMs);
		const metrics = {
			...snapshot,
			duplicateFrames: state.window.duplicateFrames,
			droppedFrames: state.window.droppedFrames,
			inputFps: (state.window.inputFrames * 1000) / elapsedMs,
			outputFps: (state.window.outputFrames * 1000) / elapsedMs,
			windowElapsedMs: elapsedMs,
		};

		state.window = createWindowMetrics(timestampMs);
		return metrics;
	}

	function pushFrame(frameBuffer, timestampMs = nowMs()) {
		recordInput();
		state.lastInputAtMs = timestampMs;
		state.pendingFrames.push({
			frameBuffer,
			receivedAtMs: timestampMs,
		});
	}

	function selectEligibleFrame(timestampMs) {
		const releaseBeforeMs = timestampMs - jitterBufferMs;
		let chosenIndex = -1;

		for (let index = 0; index < state.pendingFrames.length; index += 1) {
			if (state.pendingFrames[index].receivedAtMs <= releaseBeforeMs) {
				chosenIndex = index;
				continue;
			}

			break;
		}

		if (chosenIndex >= 0) {
			const chosenFrame = state.pendingFrames[chosenIndex];
			recordDrop(chosenIndex);
			state.pendingFrames.splice(0, chosenIndex + 1);
			return chosenFrame.frameBuffer;
		}

		if (state.pendingFrames.length === 0) {
			return null;
		}

		const oldestPendingAgeMs = timestampMs - state.pendingFrames[0].receivedAtMs;
		if (oldestPendingAgeMs <= maxPendingAgeMs) {
			return null;
		}

		const chosenFrame = state.pendingFrames[state.pendingFrames.length - 1];
		recordDrop(state.pendingFrames.length - 1);
		state.pendingFrames.length = 0;
		return chosenFrame.frameBuffer;
	}

	function tick(timestampMs = nowMs()) {
		const nextFrame = selectEligibleFrame(timestampMs);

		if (nextFrame) {
			state.lastEmittedFrame = nextFrame;
			recordOutput();
			return nextFrame;
		}

		clearEmittedFrameWhenSourceIsStale(timestampMs);

		if (!state.lastEmittedFrame) {
			return null;
		}

		recordDuplicate();
		recordOutput();
		return state.lastEmittedFrame;
	}

	function resetSource() {
		state.lastEmittedFrame = null;
		state.lastInputAtMs = null;
		state.pendingFrames.length = 0;
	}

	return {
		drainWindowMetrics,
		getStatsSnapshot,
		pushFrame,
		resetSource,
		tick,
	};
}

module.exports = {
	createFramePacer,
};
