const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);

// Disable compression to reduce relay overhead and latency.
const wss = new WebSocket.Server({
	server,
	perMessageDeflate: false,
});

app.use(express.static(path.join(__dirname, "public")));

const viewers = new Set();

wss.on("connection", (ws, req) => {
	const url = req.url;

	// Browser webcam publisher sends JPEG binary frames here.
	if (url === "/esp32-stream") {
		console.log("📷 Webcam Source Connected!");

		ws.on("message", (data, isBinary) => {
			if (!isBinary) return;

			viewers.forEach((viewer) => {
				if (viewer.readyState === WebSocket.OPEN && viewer.bufferedAmount === 0) {
					viewer.send(data, { binary: true });
				}
			});
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
	console.log("=========================================");
	console.log(`🚀 Webcam Test Relay running on port ${PORT}`);
	console.log(`📷 Open webcam source page: http://127.0.0.1:${PORT}/webcam-test.html`);
	console.log(`💻 React will connect to:   ws://127.0.0.1:${PORT}/viewer`);
	console.log("=========================================");
});
