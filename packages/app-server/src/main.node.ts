import { serve } from "@hono/node-server";
import { app } from "./app";
import { getEnv } from "./env";
import { getLogger } from "./lib/instrumentation/logger";
import { getPrisma } from "./lib/prisma";

const env = getEnv((env) => [env.HOST, env.PORT]);
const logger = getLogger().child({ scope: "startup" });

async function main() {
	await getPrisma()
		.$connect()
		.then(() => {
			logger.info({ event: "prisma.client.connected" }, "Prisma client connected successfully");
		});

	serve({ fetch: app.fetch, hostname: env.HOST, port: env.PORT }, (info) => {
		logger.info({ event: "server.listening" }, "Listening for requests: " + info.address);
	});
}

void main().catch((error: unknown) => {
	logger.fatal(
		{
			event: "startup.failed",
			error,
		},
		"Failed to start server",
	);
	process.exit(1);
});
