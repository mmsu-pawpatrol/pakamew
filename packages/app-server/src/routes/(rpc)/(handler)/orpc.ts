import { onError } from "@orpc/client";
import { LoggingHandlerPlugin } from "@orpc/experimental-pino";
import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import type { router as rpcRouter } from "..";
import { $ESCALATE } from "../../../lib/constants";
import { config } from "../../../lib/instrumentation/config";
import { getLogger } from "../../../lib/instrumentation/logger";
import { applyOrpcRouteMetadata, type OrpcRouteMetadataCarrier } from "./route-template";

const logger = getLogger();

export function createOrpcHandler(router: typeof rpcRouter) {
	return new RPCHandler(router, {
		plugins: [
			new CORSPlugin(),
			new LoggingHandlerPlugin({
				logger,
				logRequestResponse: config.OBS_ENABLE_ORPC_LOG_REQUEST_RESPONSE,
				logRequestAbort: config.OBS_ENABLE_ORPC_LOG_REQUEST_ABORT,
				generateId: () => crypto.randomUUID(),
			}),
		],
		clientInterceptors: [
			async (options) => {
				applyOrpcRouteMetadata(options.context as OrpcRouteMetadataCarrier, options.procedure, options.path);
				return options.next();
			},
		],
		interceptors: [
			onError((error) => {
				logger.error({ source: "orpc.interceptor", error, [$ESCALATE]: "orpc.interceptor" }, "Application error");
			}),
		],
	});
}
