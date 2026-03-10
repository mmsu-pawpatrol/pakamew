import { getEnv } from "../../env";
import type { CoreEnv } from "../../env/core";
import type { ObservabilityEnv, ObservabilitySwitchesEnv } from "../../env/observability";

const { OTEL_ENABLED } = getEnv((env) => [env.OTEL_ENABLED]);
const otel = OTEL_ENABLED
	? getEnv((shape) => [
			shape.OTEL_EXPORTER_OTLP_ENDPOINT,
			shape.OTEL_SERVICE_NAME,
			shape.OTEL_SERVICE_VERSION,
			shape.OTEL_DEPLOYMENT_ENVIRONMENT,
		])
	: undefined;

type Preset = NonNullable<ObservabilityEnv["OBS_PRESET"]>;
type PresetDefaults = Partial<ObservabilityEnv & ObservabilitySwitchesEnv>;

const PRESET_DEFAULTS = {
	debug: {
		OBS_LOG_LEVEL: "trace",
		OBS_ENABLE_ORPC_LOG_REQUEST_RESPONSE: true,
		OBS_ENABLE_ORPC_LOG_REQUEST_ABORT: true,
		OBS_ENABLE_PRISMA_LOG_QUERIES: true,
		OBS_METRICS_DETAIL_LEVEL: "high",
		OBS_METRICS_EXPORT_INTERVAL_MS: 5_000,
	},
	dev: {
		OBS_LOG_LEVEL: "debug",
		OBS_ENABLE_ORPC_LOG_REQUEST_RESPONSE: true,
		OBS_ENABLE_ORPC_LOG_REQUEST_ABORT: true,
		OBS_ENABLE_PRISMA_LOG_QUERIES: true,
		OBS_METRICS_DETAIL_LEVEL: "high",
		OBS_METRICS_EXPORT_INTERVAL_MS: 10_000,
	},
	test: {
		OBS_LOG_LEVEL: "debug",
		OBS_ENABLE_ORPC_LOG_REQUEST_RESPONSE: true,
		OBS_ENABLE_ORPC_LOG_REQUEST_ABORT: true,
		OBS_ENABLE_PRISMA_LOG_QUERIES: true,
		OBS_METRICS_DETAIL_LEVEL: "medium",
		OBS_METRICS_EXPORT_INTERVAL_MS: 10_000,
	},
	staging: {
		OBS_LOG_LEVEL: "info",
		OBS_ENABLE_ORPC_LOG_REQUEST_RESPONSE: true,
		OBS_ENABLE_ORPC_LOG_REQUEST_ABORT: true,
		OBS_ENABLE_PRISMA_LOG_QUERIES: false,
		OBS_METRICS_DETAIL_LEVEL: "medium",
		OBS_METRICS_EXPORT_INTERVAL_MS: 15_000,
	},
	prod: {
		OBS_LOG_LEVEL: "warn",
		OBS_ENABLE_ORPC_LOG_REQUEST_RESPONSE: false,
		OBS_ENABLE_ORPC_LOG_REQUEST_ABORT: true,
		OBS_ENABLE_PRISMA_LOG_QUERIES: false,
		OBS_METRICS_DETAIL_LEVEL: "low",
		OBS_METRICS_EXPORT_INTERVAL_MS: 30_000,
	},
} satisfies Record<Preset, PresetDefaults>;

const NODE_ENV_PRESET = {
	development: "dev",
	test: "test",
	production: "prod",
} satisfies Record<CoreEnv["NODE_ENV"], Preset>;

const { NODE_ENV } = getEnv((env) => [env.NODE_ENV]);
const { OBS_PRESET } = getEnv((env) => [env.OBS_PRESET.default(NODE_ENV_PRESET[NODE_ENV])]);
const PRESET = PRESET_DEFAULTS[OBS_PRESET];

const { OBS_ENABLE_DEV_TRACING } = getEnv((env) => [env.OBS_ENABLE_DEV_TRACING]);

const env = getEnv((shape) => [
	shape.OBS_ERROR_TRACE_WINDOW_MS,
	shape.OBS_LOG_LEVEL.default(OBS_ENABLE_DEV_TRACING ? "trace" : PRESET.OBS_LOG_LEVEL),
	shape.OBS_METRICS_DETAIL_LEVEL.default(PRESET.OBS_METRICS_DETAIL_LEVEL),
	shape.OBS_METRICS_EXPORT_INTERVAL_MS.default(PRESET.OBS_METRICS_EXPORT_INTERVAL_MS),

	shape.OBS_ENABLE_ORPC_LOG_REQUEST_RESPONSE.default(PRESET.OBS_ENABLE_ORPC_LOG_REQUEST_RESPONSE),
	shape.OBS_ENABLE_ORPC_LOG_REQUEST_ABORT.default(PRESET.OBS_ENABLE_ORPC_LOG_REQUEST_ABORT),
	shape.OBS_ENABLE_PRISMA_LOG_QUERIES.default(PRESET.OBS_ENABLE_PRISMA_LOG_QUERIES),
]);

export const config = {
	OBS_PRESET,
	OBS_ENABLE_DEV_TRACING,
	otel,
	...env,
};
