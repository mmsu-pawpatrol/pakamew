import { os } from "@orpc/server";
import { getLogger } from "../../../instrumentation/core";
import { FeederTriggerInputSchema, FeederTriggerResponseSchema } from "./shared/contracts";
import { publishFeederCommand } from "./shared/mqtt-relay";

const logger = getLogger().child({ scope: "feeder.trigger" });

export const trigger = os
	.route({ method: "POST", path: "/feeder/trigger" })
	.input(FeederTriggerInputSchema)
	.output(FeederTriggerResponseSchema)
	.handler(async ({ input }) => {
		logger.info({ event: "feeder.trigger.request", mode: input.mode }, "Received feeder trigger request");
		return await publishFeederCommand(input);
	});
