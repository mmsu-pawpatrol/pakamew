import z from "zod";

export interface CoreEnv {
	/** Current Node runtime environment. */
	NODE_ENV: "development" | "test" | "production";

	/** Database connection string used by Prisma. */
	DATABASE_URL: string;

	/** Better-Auth secret key */
	BETTER_AUTH_SECRET: string;

	/** Better-Auth URL */
	BETTER_AUTH_URL: string;

	/** Host/IP address that the server binds to. */
	HOST: string;

	/** TCP port that the server listens on. */
	PORT: number;
}

export const CoreEnvSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

	DATABASE_URL: z.string().min(1),

	BETTER_AUTH_SECRET: z.string().min(1),

	BETTER_AUTH_URL: z.string().min(1),

	HOST: z.string().min(1).default("127.0.0.1"),

	PORT: z.coerce.number().int().min(1).max(65535).default(3000),
}) satisfies z.ZodType<CoreEnv>;
