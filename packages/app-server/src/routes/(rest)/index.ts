import { Scalar } from "@scalar/hono-api-reference";
import type { Hono } from "hono";
import { initAuthRoutes } from "./auth";
import { initHealthRoutes } from "./health";

function initScalarRoutes(app: Hono) {
	app.get(
		"/api",
		Scalar({
			pageTitle: "Pakamew API",
			sources: [
				{ title: "oRPC", url: "/api/openapi/orpc.json", slug: "orpc" },
				{ title: "Auth", url: "/api/auth/open-api/generate-schema", slug: "auth" },
			],
			agent: {
				disabled: true,
				hideAddApi: true,
			},
		}),
	);
}

export function initRestRoutes(app: Hono) {
	initAuthRoutes(app);
	initHealthRoutes(app);
	initScalarRoutes(app);
}
