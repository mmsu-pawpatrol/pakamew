require("dotenv").config();

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const { createFfmpegRtmpForwarder } = require("./ffmpeg/rtmp-forwarder");
const { createOmePlaybackUrls } = require("./ome-playback-urls");

const app = express();
const server = http.createServer(app);

// Disable compression to reduce relay overhead and latency.
const wss = new WebSocket.Server({
	server,
	perMessageDeflate: false,
});

app.use(express.static(path.join(__dirname, "public")));

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
const omePlaybackUrls = createOmePlaybackUrls(OME_RTMP_URL);

const omeForwarder = ENABLE_OME_FORWARD
	? createFfmpegRtmpForwarder({
			ffmpegPath: FFMPEG_PATH,
			rtmpUrl: OME_RTMP_URL,
			streamFps: STREAM_FPS,
		})
	: null;

wss.on("connection", (ws, req) => {
	const url = req.url;

	// Browser webcam publisher sends JPEG binary frames here.
	if (url === "/esp32-stream") {
		console.log("📷 Webcam Source Connected!");

		ws.on("message", (data, isBinary) => {
			if (!isBinary) return;
			const frameBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

			viewers.forEach((viewer) => {
				if (viewer.readyState === WebSocket.OPEN && viewer.bufferedAmount === 0) {
					viewer.send(frameBuffer, { binary: true });
				}
			});

			if (omeForwarder) {
				omeForwarder.pushFrame(frameBuffer);
			}
		});

		ws.on("close", () => console.log("📷 Webcam Source Disconnected!"));
		ws.on("error", (err) => console.error("Webcam Source Error:", err));
	}
	// React frontend viewer receives relayed JPEG binary frames.
	else if (url === "/viewer") {
		console.log("👁️ React Web Viewer Connected!");
		viewers.add(ws);

		ws.on("close", () => {
			console.log("👁️ React Web Viewer Disconnected!");
			viewers.delete(ws);
		});
		ws.on("error", () => viewers.delete(ws));
	}
	// Reject anything else.
	else {
		ws.close();
	}
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
	if (omeForwarder) {
		omeForwarder.start();
		console.log(`OME forwarding enabled -> ${OME_RTMP_URL} (fps=${STREAM_FPS})`);
		if (omePlaybackUrls) {
			console.log(`OME WebRTC sample URL: ${omePlaybackUrls.webRtcUrl}`);
			console.log(`OME LL-HLS sample URL: ${omePlaybackUrls.llhlsUrl}`);
		}
	} else {
		console.log("OME forwarding disabled (set ENABLE_OME_FORWARD=true to enable)");
	}

	console.log("=========================================");
	console.log(`🚀 Webcam Test Relay running on port ${PORT}`);
	console.log(`📷 Open webcam source page: http://127.0.0.1:${PORT}/webcam.html`);
	console.log(`💻 React will connect to:   ws://127.0.0.1:${PORT}/viewer`);
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
