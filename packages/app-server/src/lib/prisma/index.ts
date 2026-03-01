import { getLogger } from "../instrumentation/logger";
import { initPrismaClient } from "./client";
import { instrument } from "./instrumentation";

const prisma = initPrismaClient();

instrument(prisma);
getLogger().child({ scope: "prisma" }).info(
	{
		event: "prisma.client.initialized",
	},
	"Prisma client initialized with instrumentation",
);

export function getPrisma() {
	return prisma;
}
