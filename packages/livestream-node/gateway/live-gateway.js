const { performance } = require("node:perf_hooks");
const { createLogger } = require("../ffmpeg/logging");
const { createFramePacer } = require("./frame-pacer");
const { createOmeDriftMonitor } = require("./ome-drift-monitor");

const DEFAULT_STATS_INTERVAL_MS = 1000;

function createNormalizedLivestreamGateway(options) {
	const {
		jitterBufferMs,
		llhlsUrl = null,
		logPrefix = "[gateway]",
		maxPendingAgeMs,
		omeForwarder = null,
		sourceStaleTimeoutMs,
		targetOutputFps,
	} = options;

	const logger = createLogger(logPrefix);
	const framePacer = createFramePacer({
		jitterBufferMs,
		maxPendingAgeMs,
		sourceStaleTimeoutMs,
		targetOutputFps,
	});
	const driftMonitor = createOmeDriftMonitor({ llhlsUrl });
	const viewers = new Set();
	const frameIntervalMs = 1000 / targetOutputFps;

	const state = {
		nextTickAtMs: null,
		statsTimer: null,
		tickTimer: null,
		running: false,
	};

	function broadcastFrame(frameBuffer) {
		viewers.forEach((viewer) => {
			if (viewer.readyState !== viewer.OPEN) return;
			if (viewer.bufferedAmount !== 0) return;
			viewer.send(frameBuffer, { binary: true });
		});

		if (omeForwarder) {
			omeForwarder.pushFrame(frameBuffer);
		}
	}

	function logMetrics() {
		const metrics = framePacer.drainWindowMetrics();
		const latestDriftMs = driftMonitor.getLatestDriftMs();

		if (
			metrics.inputFps === 0 &&
			metrics.outputFps === 0 &&
			metrics.pendingFrames === 0 &&
			viewers.size === 0 &&
			latestDriftMs == null
		) {
			return;
		}

		const driftText = latestDriftMs == null ? "n/a" : `${latestDriftMs.toFixed(0)}ms`;
		logger.info(
			[
				`input=${metrics.inputFps.toFixed(1)}fps`,
				`output=${metrics.outputFps.toFixed(1)}fps`,
				`duplicates=${metrics.duplicateFrames}`,
				`dropped=${metrics.droppedFrames}`,
				`pending=${metrics.pendingFrames}`,
				`oldest_pending_age=${metrics.oldestPendingAgeMs.toFixed(0)}ms`,
				`viewers=${viewers.size}`,
				`llhls_drift=${driftText}`,
			].join(" | "),
		);
	}

	function scheduleTick() {
		if (!state.running || state.nextTickAtMs == null) return;

		const delayMs = Math.max(0, state.nextTickAtMs - performance.now());
		state.tickTimer = setTimeout(() => {
			const tickStartedAtMs = performance.now();
			const frameBuffer = framePacer.tick(tickStartedAtMs);

			if (frameBuffer) {
				broadcastFrame(frameBuffer);
			}

			state.nextTickAtMs += frameIntervalMs;
			while (state.nextTickAtMs <= tickStartedAtMs) {
				state.nextTickAtMs += frameIntervalMs;
			}

			scheduleTick();
		}, delayMs);
	}

	return {
		addViewer: (viewer) => {
			viewers.add(viewer);
		},
		pushSourceFrame: (frameBuffer) => {
			framePacer.pushFrame(frameBuffer);
		},
		removeViewer: (viewer) => {
			viewers.delete(viewer);
		},
		resetSource: () => {
			framePacer.resetSource();
		},
		start: () => {
			if (state.running) return;

			state.running = true;
			state.nextTickAtMs = performance.now() + frameIntervalMs;
			scheduleTick();

			// Temporarily Disable - Pollutes Logs
			// state.statsTimer = setInterval(logMetrics, DEFAULT_STATS_INTERVAL_MS);

			driftMonitor.start();

			logger.info(
				`normalized pipeline started | target=${targetOutputFps}fps | jitter=${jitterBufferMs}ms | max_pending_age=${maxPendingAgeMs}ms`,
			);
		},
		stop: () => {
			if (!state.running) return;

			state.running = false;
			state.nextTickAtMs = null;

			if (state.tickTimer) {
				clearTimeout(state.tickTimer);
				state.tickTimer = null;
			}

			if (state.statsTimer) {
				clearInterval(state.statsTimer);
				state.statsTimer = null;
			}

			driftMonitor.stop();
			framePacer.resetSource();
			viewers.clear();
		},
	};
}

module.exports = {
	createNormalizedLivestreamGateway,
};
