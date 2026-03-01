import z from "zod";

export interface ObservabilityEnv {
	/** Observability preset profile. */
	OBS_PRESET?: "debug" | "dev" | "test" | "staging" | "prod";

	/** Milliseconds to keep TRACE logging after an error. */
	OBS_ERROR_TRACE_WINDOW_MS: number;

	/** Override pino log level. */
	OBS_LOG_LEVEL?: "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "silent";

	/** Override metrics detail profile. */
	OBS_METRICS_DETAIL_LEVEL?: "high" | "medium" | "low";

	/** Override metrics export interval; 0 means preset default. */
	OBS_METRICS_EXPORT_INTERVAL_MS: number;
}

export const ObservabilityEnvSchema = z.object({
	OBS_PRESET: z.enum(["debug", "dev", "test", "staging", "prod"]).optional(),

	OBS_ERROR_TRACE_WINDOW_MS: z.coerce.number().int().min(1000).default(120_000),

	OBS_LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal", "silent"]).optional(),

	OBS_METRICS_DETAIL_LEVEL: z.enum(["high", "medium", "low"]).optional(),

	OBS_METRICS_EXPORT_INTERVAL_MS: z.coerce.number().int().min(0).default(0),
}) satisfies z.ZodType<ObservabilityEnv>;

export interface ObservabilitySwitchesEnv {
	/** Enables TRACE logs in the dev preset. */
	OBS_ENABLE_DEV_TRACING: boolean;

	/** Override oRPC request/response logging. */
	OBS_ENABLE_ORPC_LOG_REQUEST_RESPONSE?: boolean;

	/** Override oRPC abort logging. */
	OBS_ENABLE_ORPC_LOG_REQUEST_ABORT?: boolean;

	/** Override Prisma query event logging. */
	OBS_ENABLE_PRISMA_LOG_QUERIES?: boolean;
}

export const ObservabilitySwitchesEnvSchema = z.object({
	OBS_ENABLE_DEV_TRACING: z.coerce.boolean().default(false),

	OBS_ENABLE_ORPC_LOG_REQUEST_RESPONSE: z.coerce.boolean().optional(),

	OBS_ENABLE_ORPC_LOG_REQUEST_ABORT: z.coerce.boolean().optional(),

	OBS_ENABLE_PRISMA_LOG_QUERIES: z.coerce.boolean().optional(),
}) satisfies z.ZodType<ObservabilitySwitchesEnv>;
