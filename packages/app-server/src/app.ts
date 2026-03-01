import "./lib/instrumentation/otel";
import { httpInstrumentationMiddleware } from "@hono/otel";
import { Hono } from "hono";
import { routePath } from "hono/route";
import { auth } from "./auth";
import { config } from "./lib/instrumentation/config";
import { readRequestRouteTemplate, toHttpSpanName } from "./lib/instrumentation/utils/route-templates";
import { initRestRoutes, initRpcRoutes } from "./routes";
import { getAuthWildcardRouteTemplate, matchAuthRouteTemplate } from "./routes/(rest)/(auth)/route-template";

export function createApp() {
	const app = new Hono();
	const authWildcardRouteTemplate = getAuthWildcardRouteTemplate(auth);

	if (config.otel) {
		app.use(
			"*",
			httpInstrumentationMiddleware({
				captureActiveRequests: true,
				spanNameFactory: (c) => {
					const method = c.req.method;
					const routeTemplateFromContext = readRequestRouteTemplate(c.req.raw);

					if (typeof routeTemplateFromContext === "string" && routeTemplateFromContext.length > 0) {
						return toHttpSpanName(method, routeTemplateFromContext);
					}

					if (c.req.path.startsWith("/api/auth")) {
						const match = matchAuthRouteTemplate(auth, method, c.req.path);
						return toHttpSpanName(method, match?.template ?? authWildcardRouteTemplate);
					}

					const matchedTemplate = routePath(c, -1) || routePath(c) || c.req.path;
					return toHttpSpanName(method, matchedTemplate);
				},
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
