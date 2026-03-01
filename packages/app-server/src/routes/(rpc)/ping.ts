import { os } from "@orpc/server";
import z from "zod";
import { getLogger } from "../../lib/instrumentation/logger";

export const ping = os
	.route({ method: "GET", path: "/ping" })
	.input(z.unknown())
	.output(z.string())
	.handler(() => {
		const logger = getLogger().child({ scope: "ping" });
		logger.info({ event: "ping.pong" }, "Ping pong");
		return "pong";
	})
	.callable();
