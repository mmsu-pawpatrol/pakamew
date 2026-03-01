import type { ObservabilityEnv } from "../../../env/observability";

type OBS_LOG_LEVEL = NonNullable<ObservabilityEnv["OBS_LOG_LEVEL"]>;
type OBS_METRICS_DETAIL_LEVEL = NonNullable<ObservabilityEnv["OBS_METRICS_DETAIL_LEVEL"]>;

/**
 * Higher weight means a "greater" level when comparing two enum values.
 * For log levels this follows severity/strictness, not verbosity.
 */
export const OBS_LOG_LEVEL_WEIGHTS = {
	trace: 10,
	debug: 20,
	info: 30,
	warn: 40,
	error: 50,
	fatal: 60,
	silent: 70,
} as const satisfies Record<OBS_LOG_LEVEL, number>;

/**
 * Higher weight means a "greater" level.
 * high > medium > low
 */
export const OBS_METRICS_DETAIL_LEVEL_WEIGHTS = {
	low: 10,
	medium: 20,
	high: 30,
} as const satisfies Record<OBS_METRICS_DETAIL_LEVEL, number>;
