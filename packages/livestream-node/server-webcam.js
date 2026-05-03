require("dotenv").config();

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const { createFfmpegRtmpForwarder } = require("./ffmpeg/rtmp-forwarder");
const { parseBooleanEnv, resolveGatewayConfig } = require("./gateway/config");
const { createNormalizedLivestreamGateway } = require("./gateway/live-gateway");
const { createOmePlaybackUrls } = require("./ome-playback-urls");

const app = express();
const server = http.createServer(app);

// Disable compression to reduce relay overhead and latency.
const wss = new WebSocket.Server({
	server,
	perMessageDeflate: false,
});

app.use(express.static(path.join(__dirname, "public")));

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
	logPrefix: "[gateway:webcam]",
	maxPendingAgeMs: gatewayConfig.maxPendingAgeMs,
	omeForwarder,
	sourceStaleTimeoutMs: gatewayConfig.sourceStaleTimeoutMs,
	targetOutputFps: gatewayConfig.targetOutputFps,
});

app.get("/health", (_req, res) => {
	res.json({
		status: "ok",
		omeForwardingEnabled: ENABLE_OME_FORWARD,
	});
});

wss.on("connection", (ws, req) => {
	const url = req.url;

	// Browser webcam publisher sends JPEG binary frames here.
	if (url === "/esp32-stream") {
		console.log("📷 Webcam Source Connected!");

		ws.on("message", (data, isBinary) => {
			if (!isBinary) return;
			const frameBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
			gateway.pushSourceFrame(frameBuffer);
		});

		ws.on("close", () => {
			gateway.resetSource();
			console.log("📷 Webcam Source Disconnected!");
		});
		ws.on("error", (err) => console.error("Webcam Source Error:", err));
	}
	// React frontend viewer receives relayed JPEG binary frames.
	else if (url === "/viewer") {
		console.log("👁️ React Web Viewer Connected!");
		gateway.addViewer(ws);

		ws.on("close", () => {
			console.log("👁️ React Web Viewer Disconnected!");
			gateway.removeViewer(ws);
		});
		ws.on("error", () => gateway.removeViewer(ws));
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
	console.log(`🚀 Webcam Test Relay running on port ${PORT}`);
	console.log(`📷 Open webcam source page: http://127.0.0.1:${PORT}/webcam.html`);
	console.log(`💻 React will connect to:   ws://127.0.0.1:${PORT}/viewer`);
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
