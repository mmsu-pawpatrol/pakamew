/**
 * Root oRPC router and HTTP route mounting.
 */

import { onError } from "@orpc/client";
import { LoggingHandlerPlugin } from "@orpc/experimental-pino";
import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler, type OpenAPIHandlerOptions } from "@orpc/openapi/fetch";
import type { Context, RouterClient } from "@orpc/server";
import { RequestHeadersPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { Hono } from "hono";
import { $ESCALATE, config, getLogger } from "../../instrumentation/core";
import { OrpcInstrumentation } from "../../instrumentation/integrations";
import { donations } from "./donations";
import { feeder } from "./feeder";
import { ping } from "./ping";
import { webhook } from "./webhooks";

/** Root oRPC router published through OpenAPI and RPC handlers. */
export const router = {
	donations,
	feeder,
	ping,
	webhook,
};

/** Typed client shape generated from the root oRPC router. */
export type RPCRouterClient = RouterClient<typeof router>;

const logger = getLogger();

type HandlerContext = Context & { reqHeaders?: Headers };

const handlerOptions = {
	plugins: [
		new RequestHeadersPlugin(),
		new LoggingHandlerPlugin({
			logger,
			logRequestResponse: config.OBS_ENABLE_ORPC_LOG_REQUEST_RESPONSE,
			logRequestAbort: config.OBS_ENABLE_ORPC_LOG_REQUEST_ABORT,
			generateId: () => crypto.randomUUID(),
		}),
	],
	clientInterceptors: [OrpcInstrumentation.clientInterceptor()],
	interceptors: [
		onError((error) => {
			logger.error({ source: "orpc.interceptor", error, [$ESCALATE]: "orpc.interceptor" }, "Application error");
		}),
	],
} satisfies OpenAPIHandlerOptions<HandlerContext>;

const openApiHandler = new OpenAPIHandler(router, handlerOptions);
const openApiDispatch = OrpcInstrumentation.handler({ handler: openApiHandler });

/** Hono router containing all oRPC and generated OpenAPI endpoints. */
export const routes = new Hono();

// oRPC OpenAPI specification
const openAPIGenerator = new OpenAPIGenerator({
	schemaConverters: [new ZodToJsonSchemaConverter()],
});

routes.get("/api/openapi/orpc.json", async (c) => {
	const spec = await openAPIGenerator.generate(router, {
		info: { title: "Pakamew oRPC API", version: "1.0.0" },
		servers: [{ url: "/api" }],
	});

	return c.json(spec);
});

routes.all("/api/*", OrpcInstrumentation.middleware(), openApiDispatch);
