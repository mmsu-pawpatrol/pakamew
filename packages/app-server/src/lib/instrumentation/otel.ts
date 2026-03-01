import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { AlwaysOnSampler } from "@opentelemetry/sdk-trace-base";
import { ORPCInstrumentation } from "@orpc/otel";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { config } from "./config";

interface TelemetryState {
	started: boolean;
	hooksRegistered: boolean;
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

function logOpenTelemetryStarted(): void {
	void import("./logger")
		.then(({ getLogger }) => {
			getLogger().child({ scope: "otel" }).info(
				{
					event: "instrumentation.otel.started",
					endpoint: config.OTEL_EXPORTER_OTLP_ENDPOINT,
					service: config.OTEL_SERVICE_NAME,
					version: config.OTEL_SERVICE_VERSION,
					environment: config.OTEL_DEPLOYMENT_ENVIRONMENT,
					preset: config.OBS_PRESET,
				},
				"OpenTelemetry SDK started",
			);
		})
		.catch(() => undefined);
}

export function initOpenTelemetry(): NodeSDK {
	const state = getGlobalTelemetryState();
	if (state.started && state.sdk) return state.sdk;

	const traceExporter = new OTLPTraceExporter({
		url: toOtlpSignalUrl(config.OTEL_EXPORTER_OTLP_ENDPOINT, "/v1/traces"),
	});

	const metricExporter = new OTLPMetricExporter({
		url: toOtlpSignalUrl(config.OTEL_EXPORTER_OTLP_ENDPOINT, "/v1/metrics"),
	});

	const sdk = new NodeSDK({
		sampler: new AlwaysOnSampler(),
		resource: resourceFromAttributes({
			"service.name": config.OTEL_SERVICE_NAME,
			"service.version": config.OTEL_SERVICE_VERSION,
			"deployment.environment": config.OTEL_DEPLOYMENT_ENVIRONMENT,
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
	logOpenTelemetryStarted();

	state.started = true;
	state.sdk = sdk;
	registerShutdownHooks(state);

	return sdk;
}

initOpenTelemetry();
