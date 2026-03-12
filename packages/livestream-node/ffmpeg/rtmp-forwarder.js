const { spawn } = require("child_process");

const { FORCE_KILL_TIMEOUT_MS } = require("./constants");
const { buildFfmpegArgs } = require("./ffmpeg-args");
const { createLogger } = require("./logging");
const { isRunning, isStdinWritable } = require("./process-utils");

/**
 * @typedef {Object} FfmpegRtmpForwarderOptions
 * @property {string} ffmpegPath Path or command name for ffmpeg binary.
 * @property {string} rtmpUrl RTMP destination URL.
 * @property {number} streamFps Expected JPEG frame rate.
 * @property {number} [restartDelayMs=2000] Restart delay when ffmpeg exits unexpectedly.
 * @property {string} [logPrefix="[ome-forwarder]"] Prefix for log lines.
 */

/**
 * @typedef {Object} FfmpegRtmpForwarder
 * @property {() => void} start Start ffmpeg and enable auto-restart.
 * @property {() => void} stop Stop ffmpeg and disable auto-restart.
 * @property {(frameBuffer: Buffer) => boolean} pushFrame Write one JPEG frame (false when dropped).
 */

/**
 * Forward JPEG buffers to OvenMediaEngine through ffmpeg + RTMP.
 *
 * The module intentionally drops frames when ffmpeg stdin backpressures to
 * preserve low latency instead of queue growth.
 *
 * @param {FfmpegRtmpForwarderOptions} options
 * @returns {FfmpegRtmpForwarder}
 */
function createFfmpegRtmpForwarder(options) {
	const { ffmpegPath, rtmpUrl, streamFps, restartDelayMs = 2000, logPrefix = "[ome-forwarder]" } = options;

	const logger = createLogger(logPrefix);
	const ffmpegArgs = buildFfmpegArgs(streamFps, rtmpUrl);

	const state = {
		ffmpegProcess: null,
		restartTimer: null,
		stopped: true,
		stdinBusy: false,
	};

	function resetProcessState() {
		state.ffmpegProcess = null;
		state.stdinBusy = false;
	}

	function clearRestartTimer() {
		if (!state.restartTimer) return;
		clearTimeout(state.restartTimer);
		state.restartTimer = null;
	}

	function scheduleRestart() {
		if (state.stopped || state.restartTimer) return;

		state.restartTimer = setTimeout(() => {
			state.restartTimer = null;
			startProcess();
		}, restartDelayMs);
	}

	function logMissingBinary() {
		logger.error(`ffmpeg binary not found at "${ffmpegPath}". Install ffmpeg or set FFMPEG_PATH.`);
	}

	function spawnProcess() {
		try {
			return spawn(ffmpegPath, ffmpegArgs, {
				stdio: ["pipe", "ignore", "pipe"],
			});
		} catch (error) {
			if (error && error.code === "ENOENT") {
				logMissingBinary();
				return null;
			}

			logger.error("failed to start ffmpeg:", error);
			scheduleRestart();
			return null;
		}
	}

	function onProcessError(error) {
		if (error && error.code === "ENOENT") {
			logMissingBinary();
			return;
		}

		logger.error("ffmpeg process error:", error);
		scheduleRestart();
	}

	function onProcessClose(code, signal) {
		resetProcessState();
		if (state.stopped) return;

		logger.error(
			`ffmpeg exited (code=${code ?? "null"}, signal=${signal ?? "null"}). Restarting in ${restartDelayMs}ms.`,
		);
		scheduleRestart();
	}

	function attachProcessHandlers(processRef) {
		processRef.on("spawn", () => {
			logger.info(`ffmpeg started -> ${rtmpUrl}`);
		});
		processRef.on("error", onProcessError);
		processRef.on("close", onProcessClose);

		processRef.stderr.on("data", (chunk) => {
			const message = chunk.toString().trim();
			if (!message) return;
			logger.error(`ffmpeg: ${message}`);
		});

		processRef.stdin.on("drain", () => {
			state.stdinBusy = false;
		});
	}

	function startProcess() {
		if (state.stopped) return;
		if (isRunning(state.ffmpegProcess)) return;

		state.stdinBusy = false;
		const processRef = spawnProcess();
		if (!processRef) return;

		state.ffmpegProcess = processRef;
		attachProcessHandlers(processRef);
	}

	function start() {
		if (!state.stopped) return;
		state.stopped = false;
		clearRestartTimer();
		startProcess();
	}

	function stop() {
		state.stopped = true;
		clearRestartTimer();

		const processRef = state.ffmpegProcess;
		resetProcessState();
		if (!processRef) return;

		if (isStdinWritable(processRef.stdin)) {
			processRef.stdin.end();
		}

		if (processRef.exitCode != null) return;

		processRef.kill("SIGTERM");
		setTimeout(() => {
			if (processRef.exitCode == null) {
				processRef.kill("SIGKILL");
			}
		}, FORCE_KILL_TIMEOUT_MS).unref();
	}

	function pushFrame(frameBuffer) {
		const processRef = state.ffmpegProcess;
		if (!isRunning(processRef)) return false;
		if (state.stdinBusy) return false;
		if (!isStdinWritable(processRef.stdin)) return false;

		const accepted = processRef.stdin.write(frameBuffer);
		if (!accepted) {
			state.stdinBusy = true;
		}
		return accepted;
	}

	return {
		start,
		stop,
		pushFrame,
	};
}

module.exports = {
	createFfmpegRtmpForwarder,
};
