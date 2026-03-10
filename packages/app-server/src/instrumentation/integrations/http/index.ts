import { httpInstrumentationMiddleware } from "@hono/otel";
import { routePath } from "hono/route";
import { config } from "../../core";
import { resolveSpanName, writeSpanNameOverride, type HttpSpanName } from "./span-name";

/**
 * HTTP instrumentation helpers for request middleware registration and
 * request-scoped root span name overrides.
 */
export const HttpInstrumentation = {
	/**
	 * Hono middleware that wires OpenTelemetry HTTP instrumentation and span naming.
	 */
	middleware() {
		return httpInstrumentationMiddleware({
			captureActiveRequests: true,
			serviceName: config.otel?.OTEL_SERVICE_NAME,
			serviceVersion: config.otel?.OTEL_SERVICE_VERSION,

			spanNameFactory: (c) => {
				// worst-case scenario, use "/*" as template
				const fallback = {
					method: c.req.method,
					template: routePath(c, -1) || routePath(c) || "/*",
				} satisfies HttpSpanName;

				const spanName = resolveSpanName(c.req.raw, fallback);
				return spanName;
			},
		});
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
