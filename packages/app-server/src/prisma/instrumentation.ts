/**
 * @internal
 * For unknown reasons, this custom Prisma Logging integration is not working as
 * expected. It is not logging any queries, info, warnings, or errors. As an
 * alternative, we are using OpenTelemetry for Prisma instrumentation.
 */

import {
	$ESCALATE,
	config,
	getLogger,
	recordPrismaQueryErrorMetrics,
	recordPrismaQueryMetrics,
} from "../instrumentation/core";
import type { PrismaClient } from "./client";

/**
 * Instrument the Prisma client with the given configuration.
 *
 * @param prisma - The Prisma client to instrument.
 */
export function instrument(prisma: PrismaClient) {
	const logger = getLogger().child({ scope: "prisma" });

	prisma.$on("query", (event) => {
		const [query] = event.query.trim().split(/\s+/, 1);
		const operation = query?.toUpperCase() ?? "UNKNOWN";

		recordPrismaQueryMetrics({ operation, durationMs: event.duration, target: event.target });
		if (config.OBS_ENABLE_PRISMA_LOG_QUERIES) {
			logger.debug({ operation, durationMs: event.duration, target: event.target }, "Prisma query executed");
		}
	});

	prisma.$on("info", (event) => {
		logger.debug({ message: event.message, target: event.target }, "Prisma info event");
	});

	prisma.$on("warn", (event) => {
		logger.warn({ message: event.message, target: event.target }, "Prisma warning event");
	});

	prisma.$on("error", (event) => {
		recordPrismaQueryErrorMetrics({ target: event.target });
		logger.error(
			{
				source: "prisma.error",
				target: event.target,
				error: new Error(event.message),
				[$ESCALATE]: "prisma.error",
			},
			"Application error",
		);
	});
}
