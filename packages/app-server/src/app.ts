import "./instrumentation/otel";
import { Hono } from "hono";
import { config } from "./instrumentation/core";
import { HttpInstrumentation } from "./instrumentation/integrations/http";
import { restRoutes, rpcRoutes } from "./routes";

export function isAppRoute(method: string, pathname: string): boolean {
	return app.router.match(method.toUpperCase(), pathname)[0].length > 0;
}

export const app = new Hono();

if (config.otel) {
	app.use("*", HttpInstrumentation.middleware());
}

app.route("/", restRoutes);
app.route("/", rpcRoutes);
