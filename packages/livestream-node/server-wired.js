require("dotenv").config();

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const { createCorsMiddleware, parseAllowedOrigins, verifyWebSocketOrigin } = require("./cors");
const { SerialPort } = require("serialport");
const { DelimiterParser } = require("@serialport/parser-delimiter");

const app = express();
const server = http.createServer(app);
const allowedOrigins = parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS);
const wss = new WebSocket.Server({
	server,
	perMessageDeflate: false,
	verifyClient: (info) => verifyWebSocketOrigin(info, allowedOrigins),
});

const USB_PORT = "COM7";
const BAUD_RATE = 1000000; //matches ESP32 exactly!

const port = new SerialPort({
	path: USB_PORT,
	baudRate: BAUD_RATE,
	highWaterMark: 1024 * 64,
});

const parser = port.pipe(new DelimiterParser({ delimiter: "\n--FRAME--\n" }));

app.use(createCorsMiddleware(allowedOrigins));
app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_req, res) => res.json({ status: "ok" }));

wss.on("connection", (ws, req) => {
	console.log("👁️ Viewer Connected");
	ws.on("message", (msg) => {
		if (msg.toString().trim() === "FEED" && port.isOpen) {
			port.write("FEED\n");
		}
	});
});

parser.on("data", (frameData) => {
	if (wss.clients.size === 0) return;

	// VALIDATION: Only send data if it starts with the JPEG header (FF D8)
	if (frameData[0] !== 0xff || frameData[1] !== 0xd8) {
		return; // let try drop corrupted data
	}

	wss.clients.forEach((viewer) => {
		if (viewer.readyState === WebSocket.OPEN && viewer.bufferedAmount === 0) {
			viewer.send(frameData, { binary: true });
		}
	});
});

const PORT = process.env.PORT || 3100;

server.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server on http://localhost:${PORT}`));
