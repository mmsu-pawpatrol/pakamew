import pino, { type DestinationStream, type Logger, type LoggerOptions } from "pino";
import { getEnv } from "../../../env";
import { $ESCALATE } from "../../constants";
import type { config } from "../config";

const { NODE_ENV } = getEnv((env) => [env.NODE_ENV]);

const DEFAULT_ESCALATION_REASON = "error";

export type LoggerConfig = Pick<
	typeof config,
	| "OTEL_SERVICE_NAME"
	| "OTEL_SERVICE_VERSION"
	| "OTEL_DEPLOYMENT_ENVIRONMENT"
	| "OTEL_EXPORTER_OTLP_ENDPOINT"
	| "OBS_PRESET"
	| "OBS_LOG_LEVEL"
	| "OBS_ERROR_TRACE_WINDOW_MS"
>;

export type EscalationLogEntry = Record<string, unknown> & {
	[$ESCALATE]?: string | boolean;
};

function asEscalationLogEntry(value: unknown): EscalationLogEntry | undefined {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
	return value as EscalationLogEntry;
}

function resolveEscalationReason(marker: EscalationLogEntry[typeof $ESCALATE]): string | undefined {
	if (marker === true) return DEFAULT_ESCALATION_REASON;
	if (typeof marker === "string" && marker.length > 0) return marker;
	return undefined;
}

function toOtlpLogsEndpoint(endpoint: string): string {
	return `${endpoint.replace(/\/+$/, "")}/v1/logs`;
}

function buildLoggerTransport(config: LoggerConfig): NonNullable<LoggerOptions["transport"]> {
	const otelLogsTarget = {
		target: "pino-opentelemetry-transport",
		options: {
			loggerName: config.OTEL_SERVICE_NAME,
			serviceVersion: config.OTEL_SERVICE_VERSION,
			resourceAttributes: {
				"service.name": config.OTEL_SERVICE_NAME,
				"service.version": config.OTEL_SERVICE_VERSION,
				"deployment.environment": config.OTEL_DEPLOYMENT_ENVIRONMENT,
				"observability.preset": config.OBS_PRESET,
			},
			logRecordProcessorOptions: {
				recordProcessorType: "batch",
				exporterOptions: {
					protocol: "http/protobuf",
					protobufExporterOptions: {
						url: toOtlpLogsEndpoint(config.OTEL_EXPORTER_OTLP_ENDPOINT),
					},
				},
			},
		},
	} as const;

	if (NODE_ENV === "development") {
		return {
			targets: [{ target: "pino-pretty", options: { colorize: true } }, otelLogsTarget],
		};
	}

	return {
		targets: [{ target: "pino/file", options: { destination: 1 } }, otelLogsTarget],
	};
}

export function initLogger(config: LoggerConfig, destination?: DestinationStream): Logger {
	let resetTraceTimeout: NodeJS.Timeout | undefined;
	const defaultLevel = config.OBS_LOG_LEVEL;
	const traceWindowMs = config.OBS_ERROR_TRACE_WINDOW_MS;

	const revertTraceLevel = () => {
		logger.level = defaultLevel;
		logger.info({ level: defaultLevel }, "Reverting logger level after TRACE escalation window");
	};

	const scheduleTraceRevert = () => {
		if (resetTraceTimeout) clearTimeout(resetTraceTimeout);
		resetTraceTimeout = setTimeout(revertTraceLevel, traceWindowMs);
	};

	const escalateTraceLogging = (reason: string) => {
		if (defaultLevel === "trace") return;
		logger.level = "trace";
		logger.warn({ reason, windowMs: traceWindowMs }, "Temporarily escalating logger level to TRACE after error");
		scheduleTraceRevert();
	};

	const options: LoggerOptions = {
		name: config.OTEL_SERVICE_NAME,
		level: defaultLevel,
		base: {
			service: config.OTEL_SERVICE_NAME,
			version: config.OTEL_SERVICE_VERSION,
			environment: config.OTEL_DEPLOYMENT_ENVIRONMENT,
			preset: config.OBS_PRESET,
		},
		redact: {
			paths: ["req.headers.authorization", "req.headers.cookie", "headers.authorization", "headers.cookie"],
		},
		hooks: {
			logMethod(args, method) {
				const entry = asEscalationLogEntry(args[0]);
				if (!entry || !($ESCALATE in entry)) {
					return method.apply(this, args);
				}

				const reason = resolveEscalationReason(entry[$ESCALATE]);
				if (reason) escalateTraceLogging(reason);
				return method.apply(this, args);
			},
		},
	};

	if (!destination) {
		options.transport = buildLoggerTransport(config);
	}

	const logger = destination ? pino(options, destination) : pino(options);

	return logger;
}
