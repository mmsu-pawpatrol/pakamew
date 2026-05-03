import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "../../auth";
import { allowedOrigins } from "../../cors";
import { BetterAuthInstrumentation } from "../../instrumentation/integrations";

export const routes = new Hono();

routes.use(
	"/api/auth/*",
	cors({
		origin: allowedOrigins,
		allowMethods: ["GET", "POST", "OPTIONS"],
		credentials: true,
	}),
);

// Better Auth Entrypoint
routes.on(["GET", "POST"], "/api/auth/*", BetterAuthInstrumentation.middleware({ auth }), (c) =>
	auth.handler(c.req.raw),
);

// Health Endpoint
routes.get("/api/health", (c) => c.json({ status: "ok" }));

// Scalar OpenAPI Documentation
routes.get(
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
