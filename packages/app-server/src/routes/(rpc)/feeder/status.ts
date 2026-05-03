import { os } from "@orpc/server";
import z from "zod";
import { getLogger } from "../../../instrumentation/core";
import { FeederStatusSchema } from "./shared/contracts";
import { getFeederStatus } from "./shared/mqtt-relay";

const logger = getLogger().child({ scope: "feeder.status" });

export const status = os
	.route({ method: "GET", path: "/feeder/status" })
	.input(z.unknown())
	.output(FeederStatusSchema)
	.handler(() => {
		logger.info({ event: "feeder.status.request" }, "Loaded feeder status");
		return getFeederStatus();
	});
