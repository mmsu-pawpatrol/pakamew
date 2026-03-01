import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient as PrismaClientGenerated } from "../../../prisma/generated/client";
import { getEnv } from "../../env";

const env = getEnv((shape) => [shape.NODE_ENV, shape.DATABASE_URL]);

/**
 * Initialize a Prisma client with the given configuration.
 *
 * @returns The Prisma client.
 */
export function initPrismaClient() {
	const prisma = new PrismaClientGenerated({
		adapter: new PrismaPg({
			connectionString: env.DATABASE_URL,
		}),
		errorFormat: env.NODE_ENV == "development" ? "pretty" : "colorless",
		log: [
			{ emit: "event", level: "query" },
			{ emit: "event", level: "info" },
			{ emit: "event", level: "warn" },
			{ emit: "event", level: "error" },
		],
	});

	return prisma;
}

export type PrismaClient = ReturnType<typeof initPrismaClient>;
