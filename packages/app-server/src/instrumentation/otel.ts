import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { AlwaysOnSampler } from "@opentelemetry/sdk-trace-base";
import { ORPCInstrumentation } from "@orpc/otel";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { config } from "./core";

interface TelemetryState {
	started: boolean;
	hooksRegistered: boolean;
	disabledLogged: boolean;
	sdk: NodeSDK | undefined;
}

type GlobalTelemetryState = typeof globalThis & {
	__pakamewTelemetryState?: TelemetryState;
};

function toOtlpSignalUrl(baseUrl: string, signalPath: string): string {
	return `${baseUrl.replace(/\/+$/, "")}${signalPath}`;
}

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

function registerShutdownHooks(state: TelemetryState): void {
	if (state.hooksRegistered || !state.sdk) return;
	state.hooksRegistered = true;

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
