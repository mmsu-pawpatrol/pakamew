import { httpInstrumentationMiddleware } from "@hono/otel";
import type { Context, MiddlewareHandler } from "hono";
import { matchedRoutes, routePath } from "hono/route";
import { config } from "../../core";
import { selectMostSpecificRouteTemplate } from "../utils/route-templates";
import { resolveSpanName, writeSpanNameOverride, type HttpSpanName } from "./span-name";

const EXCLUDED_TRACE_PATHS = new Set(["/api/health"]);

function resolveFallbackRouteTemplate(c: Context): string {
	const matchedRoute = selectMostSpecificRouteTemplate(
		matchedRoutes(c).map((route) => ({
			method: route.method,
			template: route.path,
		})),
	);

	return matchedRoute?.template ?? routePath(c, -1) ?? routePath(c) ?? "/*";
}

/**
 * HTTP instrumentation helpers for request middleware registration and
 * request-scoped root span name overrides.
 */
export const HttpInstrumentation = {
	/**
	 * Hono middleware that wires OpenTelemetry HTTP instrumentation and span naming.
	 */
	middleware() {
		const instrument: MiddlewareHandler = httpInstrumentationMiddleware({
			captureActiveRequests: true,
			serviceName: config.otel?.OTEL_SERVICE_NAME,
			serviceVersion: config.otel?.OTEL_SERVICE_VERSION,

			spanNameFactory: (c) => {
				// worst-case scenario, use "/*" as template
				const fallback = {
					method: c.req.method,
					template: resolveFallbackRouteTemplate(c),
				} satisfies HttpSpanName;

				const spanName = resolveSpanName(c.req.raw, fallback);
				return spanName;
			},
		});

		return (async (c, next) => {
			const pathname = new URL(c.req.url).pathname;
			if (EXCLUDED_TRACE_PATHS.has(pathname)) {
				await next();
				return;
			}

			return instrument(c, next);
		}) satisfies MiddlewareHandler;
	},

	/**
	 * Overrides the current request's root HTTP span name input.
	 * @param request - The request object associated with the current flow.
	 * @param input - The method and route template used to build the root span name.
	 */
	setSpanName(request: Request, input: HttpSpanName) {
		writeSpanNameOverride(request, input);
	},
};
