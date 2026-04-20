const DEFAULT_GATEWAY_JITTER_BUFFER_MS = 167;
const DEFAULT_GATEWAY_MAX_PENDING_AGE_MS = 250;
const DEFAULT_SOURCE_STALE_TIMEOUT_MS = 1000;
const DEFAULT_TARGET_OUTPUT_FPS = 24;

function parseBooleanEnv(value, defaultValue) {
	if (value == null) return defaultValue;
	const normalized = value.toLowerCase().trim();
	if (["1", "true", "yes", "on"].includes(normalized)) return true;
	if (["0", "false", "no", "off"].includes(normalized)) return false;
	return defaultValue;
}

function parseIntegerEnv(value, defaultValue) {
	const parsed = Number.parseInt(value, 10);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultValue;
}

function resolveGatewayConfig(env = process.env) {
	return {
		targetOutputFps: parseIntegerEnv(env.TARGET_OUTPUT_FPS ?? env.STREAM_FPS, DEFAULT_TARGET_OUTPUT_FPS),
		jitterBufferMs: parseIntegerEnv(env.GATEWAY_JITTER_BUFFER_MS, DEFAULT_GATEWAY_JITTER_BUFFER_MS),
		maxPendingAgeMs: parseIntegerEnv(env.GATEWAY_MAX_PENDING_AGE_MS, DEFAULT_GATEWAY_MAX_PENDING_AGE_MS),
		sourceStaleTimeoutMs: parseIntegerEnv(env.GATEWAY_SOURCE_STALE_TIMEOUT_MS, DEFAULT_SOURCE_STALE_TIMEOUT_MS),
	};
}

module.exports = {
	parseBooleanEnv,
	parseIntegerEnv,
	resolveGatewayConfig,
};
