import type { Hono } from "hono";

export function initHealthRoutes(app: Hono) {
	app.get("/api/health", (c) => c.json({ status: "ok" }));
}
