import { trace } from "@opentelemetry/api";
import pino, { type DestinationStream, type Logger, type LoggerOptions } from "pino";
import { getEnv } from "../../../env";
import { $ESCALATE } from "../../constants";
import type { config } from "../config";

const { NODE_ENV } = getEnv((env) => [env.NODE_ENV]);

const DEFAULT_ESCALATION_REASON = "error";

export type LoggerConfig = Pick<typeof config, "otel" | "OBS_PRESET" | "OBS_LOG_LEVEL" | "OBS_ERROR_TRACE_WINDOW_MS">;

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

type OTelLoggerTransportConfig = NonNullable<LoggerConfig["otel"]>;

function isOtelLoggerTransportEnabled(
	config: LoggerConfig,
): config is LoggerConfig & { otel: OTelLoggerTransportConfig } {
	return config.otel !== undefined;
}

function buildLoggerTransport(config: LoggerConfig): NonNullable<LoggerOptions["transport"]> {
	const developmentTarget = {
		target: "pino-pretty",
		options: { colorize: true },
	} as const;
	const productionTarget = {
		target: "pino/file",
		options: { destination: 1 },
	} as const;

	const defaultTarget = NODE_ENV === "development" ? developmentTarget : productionTarget;
	if (!isOtelLoggerTransportEnabled(config)) {
		return {
			targets: [defaultTarget],
		};
	}

	const otelLogsTarget = {
		target: "pino-opentelemetry-transport",
		options: {
			loggerName: config.otel.OTEL_SERVICE_NAME,
			serviceVersion: config.otel.OTEL_SERVICE_VERSION,
			resourceAttributes: {
				"service.name": config.otel.OTEL_SERVICE_NAME,
				"service.version": config.otel.OTEL_SERVICE_VERSION,
				"deployment.environment": config.otel.OTEL_DEPLOYMENT_ENVIRONMENT,
				"observability.preset": config.OBS_PRESET,
			},
			logRecordProcessorOptions: {
				recordProcessorType: "batch",
				exporterOptions: {
					protocol: "http/protobuf",
					protobufExporterOptions: {
						url: toOtlpLogsEndpoint(config.otel.OTEL_EXPORTER_OTLP_ENDPOINT),
					},
				},
			},
		},
	} as const;

	return {
		targets: [defaultTarget, otelLogsTarget],
	};
}

export function initLogger(config: LoggerConfig, destination?: DestinationStream): Logger {
	let resetTraceTimeout: NodeJS.Timeout | undefined;
	const defaultLevel = config.OBS_LOG_LEVEL;
	const traceWindowMs = config.OBS_ERROR_TRACE_WINDOW_MS;
	const loggerName = config.otel?.OTEL_SERVICE_NAME ?? "pakamew-server";
	const baseFields: Record<string, unknown> = {
		service: loggerName,
		preset: config.OBS_PRESET,
	};
	if (config.otel?.OTEL_SERVICE_VERSION) {
		baseFields.version = config.otel.OTEL_SERVICE_VERSION;
	}
	if (config.otel?.OTEL_DEPLOYMENT_ENVIRONMENT) {
		baseFields.environment = config.otel.OTEL_DEPLOYMENT_ENVIRONMENT;
	}

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
		name: loggerName,
		level: defaultLevel,
		base: baseFields,
		redact: {
			paths: ["req.headers.authorization", "req.headers.cookie", "headers.authorization", "headers.cookie"],
		},
		mixin() {
			const span = trace.getActiveSpan();
			if (!span) return {};

			const spanContext = span.spanContext();
			return {
				trace_id: spanContext.traceId,
				span_id: spanContext.spanId,
				trace_flags: spanContext.traceFlags,
			};
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
