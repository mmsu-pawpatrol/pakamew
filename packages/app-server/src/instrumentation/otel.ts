/**
 * OpenTelemetry bootstrap for the app-server runtime.
 */

import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { AlwaysOnSampler } from "@opentelemetry/sdk-trace-base";
import { ORPCInstrumentation } from "@orpc/otel";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { config } from "./core";

/** Mutable telemetry runtime state. */
interface TelemetryState {
	/** Whether the SDK has already started. */
	started: boolean;

	/** Whether shutdown hooks were registered. */
	hooksRegistered: boolean;

	/** Whether the disabled-state log was emitted. */
	disabledLogged: boolean;

	/** Running SDK instance, when started. */
	sdk: NodeSDK | undefined;
}

/** Global telemetry singleton holder. */
type GlobalTelemetryState = typeof globalThis & {
	__pakamewTelemetryState?: TelemetryState;
};

/**
 * Convert a base OTLP URL to a signal-specific endpoint.
 *
 * @param baseUrl - Base OTLP endpoint.
 * @param signalPath - Signal path suffix.
 * @returns The full OTLP signal endpoint.
 */
function toOtlpSignalUrl(baseUrl: string, signalPath: string): string {
	return `${baseUrl.replace(/\/+$/, "")}${signalPath}`;
}

/**
 * Read or initialize the global telemetry state.
 *
 * @returns The shared telemetry state.
 */
function getGlobalTelemetryState(): TelemetryState {
	const globalState = globalThis as GlobalTelemetryState;
	globalState.__pakamewTelemetryState ??= {
		started: false,
		hooksRegistered: false,
		disabledLogged: false,
		sdk: undefined,
	};
	return globalState.__pakamewTelemetryState;
}

/**
 * Register process shutdown hooks for the telemetry SDK.
 *
 * @param state - Shared telemetry state.
 */
function registerShutdownHooks(state: TelemetryState): void {
	if (state.hooksRegistered || !state.sdk) return;
	state.hooksRegistered = true;

	// Shutdown errors should not mask the process signal that triggered shutdown.
	const shutdown = () => {
		void state.sdk?.shutdown().catch(() => undefined);
	};

	process.once("SIGTERM", () => {
		shutdown();
	});
	process.once("SIGINT", () => {
		shutdown();
	});
}

/**
 * Log that OpenTelemetry has started.
 *
 * @param params - Startup log metadata.
 */
function logOpenTelemetryStarted(params: { endpoint: string; serviceName: string; serviceVersion: string }): void {
	void import("./core/logger")
		.then(({ getLogger }) => {
			getLogger().child({ scope: "otel" }).info(
				{
					event: "instrumentation.otel.started",
					endpoint: params.endpoint,
					service: params.serviceName,
					version: params.serviceVersion,
					environment: config.otel?.OTEL_DEPLOYMENT_ENVIRONMENT,
					preset: config.OBS_PRESET,
				},
				"OpenTelemetry SDK started",
			);
		})
		.catch(() => undefined);
}

/** Log that OpenTelemetry is disabled. */
function logOpenTelemetryDisabled(): void {
	void import("./core/logger")
		.then(({ getLogger }) => {
			getLogger().child({ scope: "otel" }).warn(
				{
					event: "instrumentation.otel.disabled",
					enabled: false,
					preset: config.OBS_PRESET,
				},
				"OpenTelemetry SDK disabled",
			);
		})
		.catch(() => undefined);
}

/**
 * Initialize the OpenTelemetry SDK once for the current process.
 *
 * @returns The SDK instance when enabled.
 */
export function initOpenTelemetry(): NodeSDK | undefined {
	const state = getGlobalTelemetryState();
	if (!config.otel) {
		if (!state.disabledLogged) {
			logOpenTelemetryDisabled();
			state.disabledLogged = true;
		}
		return undefined;
	}

	if (state.started && state.sdk) return state.sdk;

	const endpoint = config.otel.OTEL_EXPORTER_OTLP_ENDPOINT;
	const serviceName = config.otel.OTEL_SERVICE_NAME;
	const serviceVersion = config.otel.OTEL_SERVICE_VERSION;

	const traceExporter = new OTLPTraceExporter({
		url: toOtlpSignalUrl(endpoint, "/v1/traces"),
	});

	const metricExporter = new OTLPMetricExporter({
		url: toOtlpSignalUrl(endpoint, "/v1/metrics"),
	});

	const sdk = new NodeSDK({
		sampler: new AlwaysOnSampler(),
		resource: resourceFromAttributes({
			"service.name": serviceName,
			"service.version": serviceVersion,
			"deployment.environment": config.otel.OTEL_DEPLOYMENT_ENVIRONMENT,
			"observability.preset": config.OBS_PRESET,
		}),
		traceExporter,
		metricReaders: [
			new PeriodicExportingMetricReader({
				exportIntervalMillis: config.OBS_METRICS_EXPORT_INTERVAL_MS,
				exporter: metricExporter,
			}),
		],
		instrumentations: [
			new ORPCInstrumentation(),
			new PrismaInstrumentation(),
			new UndiciInstrumentation(),
			new PgInstrumentation({
				addSqlCommenterCommentToQueries: true,
				ignoreConnectSpans: true,
			}),
		],
	});

	sdk.start();
	logOpenTelemetryStarted({ endpoint, serviceName, serviceVersion });

	state.started = true;
	state.sdk = sdk;
	registerShutdownHooks(state);

	return sdk;
}

initOpenTelemetry();
