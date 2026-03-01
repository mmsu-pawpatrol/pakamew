import z from "zod";

export interface OtelEnv {
	/** Toggle OpenTelemetry SDK/exporter wiring. */
	OTEL_ENABLED: boolean;

	/** OTLP endpoint used by OpenTelemetry exporters. */
	OTEL_EXPORTER_OTLP_ENDPOINT: string;

	/** Service name shown in telemetry backends. */
	OTEL_SERVICE_NAME: string;

	/** Service version shown in telemetry backends. */
	OTEL_SERVICE_VERSION: string;

	/** Deployment environment resource attribute. */
	OTEL_DEPLOYMENT_ENVIRONMENT?: string;
}

export const OtelEnvSchema = z.object({
	OTEL_ENABLED: z.coerce.boolean().default(false),

	OTEL_EXPORTER_OTLP_ENDPOINT: z.string().min(1),

	OTEL_SERVICE_NAME: z.string().min(1),

	OTEL_SERVICE_VERSION: z.string().min(1),

	OTEL_DEPLOYMENT_ENVIRONMENT: z.string().min(1).optional(),
}) satisfies z.ZodType<OtelEnv>;
