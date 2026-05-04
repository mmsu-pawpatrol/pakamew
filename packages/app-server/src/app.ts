import "./instrumentation/otel";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { allowedOrigins } from "./cors";
import { getEnv } from "./env";
import { config } from "./instrumentation/core";
import { HttpInstrumentation } from "./instrumentation/integrations/http";
import { restRoutes, rpcRoutes } from "./routes";

const { NODE_ENV } = getEnv((env) => [env.NODE_ENV]);

export function isAppRoute(method: string, pathname: string): boolean {
	return app.router.match(method.toUpperCase(), pathname)[0].length > 0;
}

export const app = new Hono();

if (config.otel) {
	app.use("*", HttpInstrumentation.middleware());
}

if (NODE_ENV !== "development") {
	app.use(
		"/api/*",
		cors({
			origin: allowedOrigins,
			credentials: true,
		}),
	);
}

app.route("/", restRoutes);
app.route("/", rpcRoutes);
