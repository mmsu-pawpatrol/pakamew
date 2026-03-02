import { createGetEnv } from "@pakamew/shared/utils/get-env";
import z from "zod";
import { EnvSchema, type Env } from "./env";

export interface ServerEnv extends Env {
	/** Current Node runtime environment. */
	NODE_ENV: "development" | "test" | "production";

	/** Host/IP address used by the web Vite dev and preview server. */
	HOST: string;

	/** TCP port used by the web Vite dev and preview server. */
	PORT: number;
}

export const ServerEnvSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]),

	HOST: z.string().min(1).default("127.0.0.1"),

	PORT: z.coerce.number().int().min(1).max(65535).default(5173),

	...EnvSchema.shape,
}) satisfies z.ZodType<ServerEnv>;

export type ServerEnvSchemaShape = typeof ServerEnvSchema.shape;

/**
 * Get a slice of the environment variables. Since the backend runs in different environments, this helper function allows only requiring a subset of environment variables at a given time (Development, Testing, CI, Production, etc.).
 *
 * @param slice - The slice of the environment variables to get.
 * @param source - The source of the environment variables.
 * @returns The environment variables for the given slice.
 */
export const getEnv = createGetEnv<ServerEnv, typeof ServerEnvSchema>(ServerEnvSchema);
