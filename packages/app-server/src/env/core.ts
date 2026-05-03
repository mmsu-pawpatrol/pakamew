import z from "zod";

export const DEFAULT_CORS_ALLOWED_ORIGINS = ["http://127.0.0.1:5173", "http://localhost:5173"] as const;

export function parseAllowedOrigins(value: string): string[] {
	const entries = value
		.split(",")
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0)
		.map((entry) => {
			const url = new URL(entry);
			if (url.protocol !== "http:" && url.protocol !== "https:")
				throw new Error(`CORS allowed origins must use http or https: ${entry}`);
			return url.origin;
		});

	return Array.from(new Set(entries));
}

export interface CoreEnv {
	/** Current Node runtime environment. */
	NODE_ENV: "development" | "test" | "production";

	/** Database connection string used by Prisma. */
	DATABASE_URL: string;

	/** Better-Auth secret key */
	BETTER_AUTH_SECRET: string;

	/** Better-Auth URL */
	BETTER_AUTH_URL: string;

	/** Browser origins allowed to call backend HTTP endpoints. */
	CORS_ALLOWED_ORIGINS: string[];

	/** Host/IP address that the server binds to. */
	HOST: string;

	/** TCP port that the server listens on. */
	PORT: number;
}

export const CoreEnvSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]),

	DATABASE_URL: z.string().min(1),

	BETTER_AUTH_SECRET: z.string().min(1),

	BETTER_AUTH_URL: z.string().min(1),

	CORS_ALLOWED_ORIGINS: z
		.string()
		.default(DEFAULT_CORS_ALLOWED_ORIGINS.join(","))
		.transform((value, ctx) => {
			try {
				return parseAllowedOrigins(value);
			} catch (error) {
				ctx.addIssue({
					code: "custom",
					message: error instanceof Error ? error.message : "Invalid CORS allowed origins.",
				});

				return z.NEVER;
			}
		}),

	HOST: z.string().min(1).default("127.0.0.1"),

	PORT: z.coerce.number().int().min(1).max(65535).default(3000),
}) satisfies z.ZodType<CoreEnv>;
