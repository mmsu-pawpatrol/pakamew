import { getLogger } from "../instrumentation/logger";
import { initPrismaClient } from "./client";

const prisma = initPrismaClient();

getLogger().child({ scope: "prisma" }).info(
	{
		event: "prisma.client.initialized",
	},
	"Prisma client initialized with instrumentation",
);

export function getPrisma() {
	return prisma;
}
