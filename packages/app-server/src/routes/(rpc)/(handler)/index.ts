import { SpanKind } from "@opentelemetry/api";
import type { Hono } from "hono";
import { $ESCALATE } from "../../../lib/constants";
import { getLogger } from "../../../lib/instrumentation/logger";
import {
	beginHttpRequestMetrics,
	recordHttpRequestMetrics,
	recordOrpcMetrics,
} from "../../../lib/instrumentation/metrics";
import { withSpan } from "../../../lib/instrumentation/tracer";
import { writeRequestRouteTemplate } from "../../../lib/instrumentation/utils/route-templates";
import { createOrpcHandler } from "./orpc";
import {
	createOrpcFallbackRouteMetadata,
	resolveOrpcHttpRouteTemplate,
	type OrpcRouteMetadata,
} from "./route-template";

const logger = getLogger();

function getPathname(url: string): string {
	return new URL(url).pathname;
}

function parseContentLength(rawValue: string | undefined): number | undefined {
	if (!rawValue) return undefined;
	const parsed = Number.parseInt(rawValue, 10);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export function initRpcHandlerRoutes(app: Hono, router: Parameters<typeof createOrpcHandler>[0]) {
	const orpcHandler = createOrpcHandler(router);

	app.use("/api/*", async (c, next) => {
		const pathname = getPathname(c.req.url);
		const routeMetadata: OrpcRouteMetadata = createOrpcFallbackRouteMetadata(pathname);
		let procedure = routeMetadata.procedure;
		let route = "/api/*";
		const method = c.req.method;
		const requestStartedAt = performance.now();
		const endInFlight = beginHttpRequestMetrics(method, route);
		const requestSizeBytes = parseContentLength(c.req.header("content-length"));
		let statusCode = 500;
		let responseSizeBytes: number | undefined;

		try {
			const orpcStartedAt = performance.now();
			const dispatchResult = await withSpan(
				"orpc.dispatch",
				async (span) => {
					const result = await orpcHandler.handle(c.req.raw, {
						context: {
							headers: c.req.raw.headers,
							orpcRouteMetadata: routeMetadata,
						},
						prefix: "/api",
					});
					if (result.matched) {
						const resolvedRouteTemplate = resolveOrpcHttpRouteTemplate(routeMetadata);
						procedure = routeMetadata.procedure;
						route = resolvedRouteTemplate;

						span.setAttribute("http.route", resolvedRouteTemplate);
						span.setAttribute("orpc.procedure", procedure);
						if (routeMetadata.operationId) {
							span.setAttribute("orpc.operation_id", routeMetadata.operationId);
						}
					}
					return result;
				},
				{
					attributes: {
						"http.method": method,
						"http.route": route,
						"orpc.procedure": procedure,
					},
					kind: SpanKind.INTERNAL,
				},
			);

			const response = dispatchResult.matched ? dispatchResult.response : (await next(), c.res);
			statusCode = response.status;
			responseSizeBytes = parseContentLength(response.headers.get("content-length") ?? undefined);

			if (!dispatchResult.matched) return;
			writeRequestRouteTemplate(c.req.raw, route);

			recordOrpcMetrics({
				procedure,
				durationMs: performance.now() - orpcStartedAt,
				result: statusCode >= 500 ? "error" : "success",
				statusCode,
			});
			return response;
		} catch (error) {
			statusCode = 500;
			recordOrpcMetrics({
				procedure,
				durationMs: performance.now() - requestStartedAt,
				result: "error",
				statusCode,
				errorCode: error instanceof Error ? error.name : "unknown_error",
			});
			logger.error(
				{
					source: "app.api.middleware",
					method,
					pathname,
					error,
					[$ESCALATE]: "app.api.middleware",
				},
				"Application error",
			);
			throw error;
		} finally {
			endInFlight();
			recordHttpRequestMetrics({
				method,
				route,
				statusCode,
				durationMs: performance.now() - requestStartedAt,
				requestSizeBytes,
				responseSizeBytes,
			});
		}
	});
}
