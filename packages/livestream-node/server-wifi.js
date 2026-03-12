const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { createFfmpegRtmpForwarder } = require("./ffmpeg/rtmp-forwarder");

const app = express();
const server = http.createServer(app);

// Disable compression to save CPU and ensure zero-latency binary streaming.
const wss = new WebSocket.Server({
	server,
	perMessageDeflate: false,
});

wss.on("error", (error) => {
	console.error("WebSocket server error:", error);
});

const viewers = new Set();

function parseBooleanEnv(value, defaultValue) {
	if (value == null) return defaultValue;
	const normalized = value.toLowerCase().trim();
	if (["1", "true", "yes", "on"].includes(normalized)) return true;
	if (["0", "false", "no", "off"].includes(normalized)) return false;
	return defaultValue;
}

function parseIntegerEnv(value, defaultValue) {
	const parsed = Number.parseInt(value, 10);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultValue;
}

const OME_RTMP_URL = process.env.OME_RTMP_URL || "rtmp://127.0.0.1:1935/app/esp32";
const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
const STREAM_FPS = parseIntegerEnv(process.env.STREAM_FPS, 10);
const ENABLE_OME_FORWARD = parseBooleanEnv(process.env.ENABLE_OME_FORWARD, false);

const omeForwarder = ENABLE_OME_FORWARD
	? createFfmpegRtmpForwarder({
			ffmpegPath: FFMPEG_PATH,
			rtmpUrl: OME_RTMP_URL,
			streamFps: STREAM_FPS,
		})
	: null;

wss.on("connection", (ws, req) => {
	const url = req.url;

	// 1. ESP32 Camera Connection
	if (url === "/esp32-stream") {
		console.log("ESP32-CAM connected over WiFi");

		ws.on("message", (data) => {
			const frameBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

			// Broadcast the raw JPEG binary to all React viewers.
			viewers.forEach((viewer) => {
				if (viewer.readyState === WebSocket.OPEN) {
					// Backpressure check: drop frame if viewer's internet is lagging.
					if (viewer.bufferedAmount === 0) {
						viewer.send(frameBuffer, { binary: true });
					}
				}
			});

			if (omeForwarder) {
				omeForwarder.pushFrame(frameBuffer);
			}
		});

		ws.on("close", () => console.log("ESP32-CAM disconnected"));
		ws.on("error", (err) => console.error("ESP32 connection error:", err));
	}
	// 2. React Frontend Connection
	else if (url === "/viewer") {
		console.log("React Web Viewer connected");
		viewers.add(ws);

		ws.on("close", () => {
			console.log("React Web Viewer disconnected");
			viewers.delete(ws);
		});
		ws.on("error", () => viewers.delete(ws));
	}
	// Reject anything else
	else {
		ws.close();
	}
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
	if (omeForwarder) {
		omeForwarder.start();
		console.log(`OME forwarding enabled -> ${OME_RTMP_URL} (fps=${STREAM_FPS})`);
	} else {
		console.log("OME forwarding disabled (set ENABLE_OME_FORWARD=true to enable)");
	}

	console.log("=========================================");
	console.log(`Video Relay Server running on port ${PORT}`);
	console.log(`ESP32 should connect to: ws://<YOUR_IP>:${PORT}/esp32-stream`);
	console.log(`React will connect to:   ws://127.0.0.1:${PORT}/viewer`);
	console.log("=========================================");
});

function shutdown() {
	console.log("Shutting down livestream-node...");
	if (omeForwarder) {
		omeForwarder.stop();
	}

	server.close(() => {
		process.exit(0);
	});

	setTimeout(() => {
		process.exit(1);
	}, 5000).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
