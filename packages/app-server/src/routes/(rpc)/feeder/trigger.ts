/**
 * Public feeder trigger procedure.
 */

import { os } from "@orpc/server";
import { getLogger } from "../../../instrumentation/core";
import { publishFeederCommand } from "./shared";
import { FeederTriggerInputSchema, FeederTriggerResponseSchema } from "./shared/contracts";

const logger = getLogger().child({ scope: "feeder.trigger" });

/** Publish a feeder command and return the relay acknowledgement result. */
export const trigger = os
	.route({ method: "POST", path: "/feeder/trigger" })
	.input(FeederTriggerInputSchema)
	.output(FeederTriggerResponseSchema)
	.handler(async ({ input }) => {
		logger.info({ event: "feeder.trigger.request", mode: input.mode }, "Received feeder trigger request");
		return await publishFeederCommand(input);
	});
