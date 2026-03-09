const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);

// Disable compression to save CPU and ensure zero-latency binary streaming
const wss = new WebSocket.Server({
	server,
	perMessageDeflate: false,
});

let viewers = new Set();

wss.on("connection", (ws, req) => {
	const url = req.url;

	// 1. ESP32 Camera Connection
	if (url === "/esp32-stream") {
		console.log("📷 ESP32-CAM Connected over WiFi!");

		ws.on("message", (data) => {
			// Broadcast the raw JPEG binary to all React viewers
			viewers.forEach((viewer) => {
				if (viewer.readyState === WebSocket.OPEN) {
					// Backpressure check: Drop frame if viewer's internet is lagging
					if (viewer.bufferedAmount === 0) {
						viewer.send(data, { binary: true });
					}
				}
			});
		});

		ws.on("close", () => console.log("📷 ESP32-CAM Disconnected!"));
		ws.on("error", (err) => console.error("ESP32 Error:", err));
	}
	// 2. React Frontend Connection
	else if (url === "/viewer") {
		console.log("👁️ React Web Viewer Connected!");
		viewers.add(ws);

		ws.on("close", () => {
			console.log("👁️ React Web Viewer Disconnected!");
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
	console.log(`=========================================`);
	console.log(`🚀 Video Relay Server running on port ${PORT}`);
	console.log(`📡 ESP32 should connect to: ws://<YOUR_IP>:3000/esp32-stream`);
	console.log(`💻 React will connect to:   ws://127.0.0.1:3000/viewer`);
	console.log(`=========================================`);
});
