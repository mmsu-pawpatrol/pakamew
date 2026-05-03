const http = require("node:http");
const https = require("node:https");

const DEFAULT_POLL_INTERVAL_MS = 5000;
const DEFAULT_REQUEST_TIMEOUT_MS = 3000;

function requestText(url, timeoutMs) {
	return new Promise((resolve, reject) => {
		const client = url.protocol === "https:" ? https : http;
		const request = client.request(
			url,
			{
				method: "GET",
				timeout: timeoutMs,
			},
			(response) => {
				if (response.statusCode == null || response.statusCode < 200 || response.statusCode >= 300) {
					response.resume();
					reject(new Error(`unexpected HTTP status ${response.statusCode ?? "unknown"}`));
					return;
				}

				let body = "";
				response.setEncoding("utf8");
				response.on("data", (chunk) => {
					body += chunk;
				});
				response.on("end", () => {
					resolve(body);
				});
			},
		);

		request.on("timeout", () => {
			request.destroy(new Error("request timed out"));
		});
		request.on("error", reject);
		request.end();
	});
}

function parseChunklistUrl(masterPlaylistText, masterPlaylistUrl) {
	const lines = masterPlaylistText.split(/\r?\n/);
	for (const line of lines) {
		if (!line || line.startsWith("#")) continue;
		return new URL(line.trim(), masterPlaylistUrl).toString();
	}

	return null;
}

function parseLatestProgramDateTime(mediaPlaylistText) {
	const lines = mediaPlaylistText.split(/\r?\n/);
	for (let index = lines.length - 1; index >= 0; index -= 1) {
		const line = lines[index];
		if (!line.startsWith("#EXT-X-PROGRAM-DATE-TIME:")) continue;
		return line.slice("#EXT-X-PROGRAM-DATE-TIME:".length).trim();
	}

	return null;
}

function createOmeDriftMonitor(options) {
	const {
		llhlsUrl,
		pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
		requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
	} = options;

	if (!llhlsUrl) {
		return {
			getLatestDriftMs: () => null,
			start: () => {},
			stop: () => {},
		};
	}

	const state = {
		latestDriftMs: null,
		latestProgramDateTime: null,
		pollTimer: null,
		polling: false,
	};

	async function pollOnce() {
		if (state.polling) return;
		state.polling = true;

		try {
			const masterPlaylistUrl = new URL(llhlsUrl);
			const masterPlaylistText = await requestText(masterPlaylistUrl, requestTimeoutMs);
			const chunklistUrl = parseChunklistUrl(masterPlaylistText, masterPlaylistUrl);

			if (!chunklistUrl) {
				state.latestDriftMs = null;
				state.latestProgramDateTime = null;
				return;
			}

			const mediaPlaylistText = await requestText(new URL(chunklistUrl), requestTimeoutMs);
			const latestProgramDateTime = parseLatestProgramDateTime(mediaPlaylistText);

			if (!latestProgramDateTime) {
				state.latestDriftMs = null;
				state.latestProgramDateTime = null;
				return;
			}

			state.latestProgramDateTime = latestProgramDateTime;
			state.latestDriftMs = Date.now() - Date.parse(latestProgramDateTime);
		} catch {
			state.latestDriftMs = null;
			state.latestProgramDateTime = null;
		} finally {
			state.polling = false;
		}
	}

	function start() {
		if (state.pollTimer) return;
		void pollOnce();
		state.pollTimer = setInterval(() => {
			void pollOnce();
		}, pollIntervalMs);
	}

	function stop() {
		if (!state.pollTimer) return;
		clearInterval(state.pollTimer);
		state.pollTimer = null;
	}

	return {
		getLatestDriftMs: () => state.latestDriftMs,
		start,
		stop,
	};
}

module.exports = {
	createOmeDriftMonitor,
};
