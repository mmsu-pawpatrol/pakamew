import type { Context } from "@orpc/server";
import type { RPCHandler } from "@orpc/server/fetch";
import type { StandardHandlerOptions } from "@orpc/server/standard";
import type { Handler, MiddlewareHandler } from "hono";
import { $ESCALATE } from "../../core/constants";
import { getLogger } from "../../core/logger";
import { recordHttpRequestMetrics, recordOrpcMetrics } from "../../core/metrics";
import { HttpInstrumentation } from "../http";
import { applyOrpcRouteMetadata, type OrpcRouteMetadataCarrier } from "./metadata-carrier";
import { createOrpcFallbackRouteMetadata, resolveOrpcHttpRouteTemplate } from "./route-template";
import {
	clearOrpcInstrumentationState,
	readOrpcInstrumentationState,
	writeOrpcDispatchError,
	writeOrpcDispatchResult,
	writeOrpcRouteMetadata,
} from "./state";

const logger = getLogger();

function parseContentLength(rawValue: string | undefined): number | undefined {
	if (!rawValue) return undefined;
	const parsed = Number.parseInt(rawValue, 10);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

/**
 * oRPC integration contract exposed to route registration.
 */
interface OrpcInstrumentationApi {
	/**
	 * Creates middleware that records request/response metrics and route metadata.
	 * @returns A Hono middleware for oRPC request instrumentation.
	 */
	middleware(): MiddlewareHandler;
	/**
	 * Creates an oRPC dispatch handler wrapper.
	 * @param deps - Handler dependencies.
	 * @param deps.handler - oRPC handler responsible for request dispatch.
	 * @returns A Hono handler that tracks dispatch state for instrumentation.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handler(deps: { handler: RPCHandler<any> }): Handler;
	/**
	 * Creates a client interceptor that enriches context with resolved route metadata.
	 * @returns An oRPC client interceptor.
	 */
	clientInterceptor(): NonNullable<StandardHandlerOptions<Context>["clientInterceptors"]>[number];
}

/**
 * Shared instrumentation wiring for oRPC request flow.
 */
export const OrpcInstrumentation: OrpcInstrumentationApi = {
	/**
	 * Applies request-level oRPC instrumentation, HTTP metrics, and cleanup.
	 */
	middleware(): MiddlewareHandler {
		return async (c, next) => {
			const pathname = new URL(c.req.url).pathname;
			const method = c.req.method;
			const fallbackRouteMetadata = createOrpcFallbackRouteMetadata(pathname);
			const requestSizeBytes = parseContentLength(c.req.header("content-length"));
			let statusCode = 500;
			let responseSizeBytes: number | undefined;

			try {
				await next();
				statusCode = c.res.status;
				responseSizeBytes = parseContentLength(c.res.headers.get("content-length") ?? undefined);
			} catch (error) {
				statusCode = c.res.status >= 400 ? c.res.status : 500;
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
				const instrumentationState = readOrpcInstrumentationState(c.req.raw);
				const routeMetadata = instrumentationState?.routeMetadata;
				const route = routeMetadata ? resolveOrpcHttpRouteTemplate(routeMetadata) : "/api/*";
				const procedure = routeMetadata?.procedure ?? fallbackRouteMetadata.procedure;
				const dispatchResult = instrumentationState?.dispatchResult;
				const dispatchError = instrumentationState?.dispatchError;

				if (dispatchResult?.matched) {
					HttpInstrumentation.setSpanName(c.req.raw, { method, template: route });
					recordOrpcMetrics({
						procedure,
						durationMs: dispatchError?.durationMs ?? dispatchResult.durationMs,
						result: statusCode >= 500 ? "error" : "success",
						statusCode,
						errorCode: dispatchError?.errorCode,
					});
				} else if (dispatchError) {
					recordOrpcMetrics({
						procedure,
						durationMs: dispatchError.durationMs,
						result: "error",
						statusCode,
						errorCode: dispatchError.errorCode,
					});
				}

				recordHttpRequestMetrics({
					method,
					route,
					statusCode,
					requestSizeBytes,
					responseSizeBytes,
				});

				clearOrpcInstrumentationState(c.req.raw);
			}
		};
	},

	/**
	 * Wraps oRPC handler dispatch and writes request-scoped dispatch state.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	handler(deps: { handler: RPCHandler<any> }): Handler {
		return async (c, next) => {
			const routeMetadata = createOrpcFallbackRouteMetadata(new URL(c.req.url).pathname);
			const start = performance.now();

			try {
				const dispatchResult = await deps.handler.handle(c.req.raw, {
					context: {
						headers: c.req.raw.headers,
						orpcRouteMetadata: routeMetadata,
					},
					prefix: "/api",
				});
				writeOrpcDispatchResult(c.req.raw, {
					matched: dispatchResult.matched,
					durationMs: performance.now() - start,
				});

				if (!dispatchResult.matched) return next();

				writeOrpcRouteMetadata(c.req.raw, routeMetadata);
				c.res = dispatchResult.response;
				return c.res;
			} catch (error) {
				writeOrpcRouteMetadata(c.req.raw, routeMetadata);
				writeOrpcDispatchError(c.req.raw, {
					durationMs: performance.now() - start,
					errorCode: error instanceof Error ? error.name : "unknown_error",
				});
				throw error;
			}
		};
	},

	/**
	 * Applies resolved route metadata into mutable oRPC context carriers.
	 */
	clientInterceptor(): NonNullable<StandardHandlerOptions<Context>["clientInterceptors"]>[number] {
		return async (options) => {
			applyOrpcRouteMetadata(options.context as OrpcRouteMetadataCarrier, options.procedure, options.path);
			return options.next();
		};
	},
};
