/**
 * Public feeder status procedure.
 */

import { os } from "@orpc/server";
import z from "zod";
import { getLogger } from "../../../instrumentation/core";
import { getFeederStatus } from "./shared";
import { FeederStatusSchema } from "./shared/contracts";

const logger = getLogger().child({ scope: "feeder.status" });

/** Load the current feeder broker and device status. */
export const status = os
	.route({ method: "GET", path: "/feeder/status" })
	.input(z.unknown())
	.output(FeederStatusSchema)
	.handler(() => {
		logger.info({ event: "feeder.status.request" }, "Loaded feeder status");
		return getFeederStatus();
	});
