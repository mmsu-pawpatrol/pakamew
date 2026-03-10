import { os } from "@orpc/server";
import z from "zod";
import { getLogger } from "../../instrumentation/core/logger";
import { getPrisma } from "../../prisma";

export const ping = os
	.route({ method: "GET", path: "/ping" })
	.input(z.unknown())
	.output(z.string())
	.handler(async () => {
		const logger = getLogger().child({ scope: "ping" });
		logger.info({ event: "ping.pong" }, "Ping pong");

		const prisma = getPrisma();
		await prisma.$queryRaw`SELECT 'pong'`;

		return "pong";
	})
	.callable();
