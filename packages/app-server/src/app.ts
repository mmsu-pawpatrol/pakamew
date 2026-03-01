import "./lib/instrumentation/otel";
import { httpInstrumentationMiddleware } from "@hono/otel";
import { Hono } from "hono";
import { config } from "./lib/instrumentation/config";
import { initRestRoutes, initRpcRoutes } from "./routes";

export function createApp() {
	const app = new Hono();

	if (config.otel) {
		app.use(
			"*",
			httpInstrumentationMiddleware({
				captureActiveRequests: true,
				serviceName: config.otel.OTEL_SERVICE_NAME,
				serviceVersion: config.otel.OTEL_SERVICE_VERSION,
			}),
		);
	}

	initRestRoutes(app);
	initRpcRoutes(app);

	return app;
}

export const app = createApp();

export function isAppRoute(method: string, pathname: string): boolean {
	return app.router.match(method.toUpperCase(), pathname)[0].length > 0;
}
