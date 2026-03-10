import { onError } from "@orpc/client";
import { LoggingHandlerPlugin } from "@orpc/experimental-pino";
import { OpenAPIGenerator } from "@orpc/openapi";
import type { RouterClient } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { Hono } from "hono";
import { $ESCALATE, config, getLogger } from "../../instrumentation/core";
import { OrpcInstrumentation } from "../../instrumentation/integrations";
import { ping } from "./ping";

// Root Router
export const router = {
	ping,
};

export type RPCRouterClient = RouterClient<typeof router>;

// Root Handler
const logger = getLogger();
const handler = new RPCHandler(router, {
	plugins: [
		new CORSPlugin(),
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
});

export const routes = new Hono();

// RPC OpenAPI Specification
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

// RPC Entrypoint
routes.all("/api/*", OrpcInstrumentation.middleware(), OrpcInstrumentation.handler({ handler }));
