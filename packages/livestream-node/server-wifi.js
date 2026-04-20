require("dotenv").config();

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { createFfmpegRtmpForwarder } = require("./ffmpeg/rtmp-forwarder");
const { parseBooleanEnv, resolveGatewayConfig } = require("./gateway/config");
const { createNormalizedLivestreamGateway } = require("./gateway/live-gateway");
const { createOmePlaybackUrls } = require("./ome-playback-urls");

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

const OME_RTMP_URL = process.env.OME_RTMP_URL || "rtmp://127.0.0.1:1935/app/esp32";
const FFMPEG_PATH = process.env.FFMPEG_PATH || "ffmpeg";
const ENABLE_OME_FORWARD = parseBooleanEnv(process.env.ENABLE_OME_FORWARD, false);
const gatewayConfig = resolveGatewayConfig(process.env);
const omePlaybackUrls = createOmePlaybackUrls(OME_RTMP_URL);

const omeForwarder = ENABLE_OME_FORWARD
	? createFfmpegRtmpForwarder({
			ffmpegPath: FFMPEG_PATH,
			rtmpUrl: OME_RTMP_URL,
			streamFps: gatewayConfig.targetOutputFps,
		})
	: null;
const gateway = createNormalizedLivestreamGateway({
	jitterBufferMs: gatewayConfig.jitterBufferMs,
	llhlsUrl: omePlaybackUrls?.llhlsUrl ?? null,
	logPrefix: "[gateway:wifi]",
	maxPendingAgeMs: gatewayConfig.maxPendingAgeMs,
	omeForwarder,
	sourceStaleTimeoutMs: gatewayConfig.sourceStaleTimeoutMs,
	targetOutputFps: gatewayConfig.targetOutputFps,
});

wss.on("connection", (ws, req) => {
	const url = req.url;

	// 1. ESP32 Camera Connection
	if (url === "/esp32-stream") {
		console.log("ESP32-CAM connected over WiFi");

		ws.on("message", (data) => {
			const frameBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
			gateway.pushSourceFrame(frameBuffer);
		});

		ws.on("close", () => {
			gateway.resetSource();
			console.log("ESP32-CAM disconnected");
		});
		ws.on("error", (err) => console.error("ESP32 connection error:", err));
	}
	// 2. React Frontend Connection
	else if (url === "/viewer") {
		console.log("React Web Viewer connected");
		gateway.addViewer(ws);

		ws.on("close", () => {
			console.log("React Web Viewer disconnected");
			gateway.removeViewer(ws);
		});
		ws.on("error", () => gateway.removeViewer(ws));
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
		console.log(`OME forwarding enabled -> ${OME_RTMP_URL} (fps=${gatewayConfig.targetOutputFps})`);
		if (omePlaybackUrls) {
			console.log(`OME WebRTC sample URL: ${omePlaybackUrls.webRtcUrl}`);
			console.log(`OME LL-HLS sample URL: ${omePlaybackUrls.llhlsUrl}`);
		}
	} else {
		console.log("OME forwarding disabled (set ENABLE_OME_FORWARD=true to enable)");
	}
	gateway.start();

	console.log("=========================================");
	console.log(`Video Relay Server running on port ${PORT}`);
	console.log(`ESP32 should connect to: ws://<YOUR_IP>:${PORT}/esp32-stream`);
	console.log(`React will connect to:   ws://127.0.0.1:${PORT}/viewer`);
	console.log(
		`Gateway pacing: ${gatewayConfig.targetOutputFps}fps | jitter=${gatewayConfig.jitterBufferMs}ms | maxPendingAge=${gatewayConfig.maxPendingAgeMs}ms`,
	);
	console.log("=========================================");
});

function shutdown() {
	console.log("Shutting down livestream-node...");
	gateway.stop();
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
