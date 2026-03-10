import {
	context,
	SpanKind,
	SpanStatusCode,
	trace,
	type Attributes,
	type Span,
	type SpanOptions,
} from "@opentelemetry/api";
import { config } from "./config";

const tracerServiceName = config.otel?.OTEL_SERVICE_NAME ?? "pakamew-server";
const tracerServiceVersion = config.otel?.OTEL_SERVICE_VERSION ?? "0.0.0";

const manualTracer = trace.getTracer(`${tracerServiceName}.manual`, tracerServiceVersion);

export interface ManualSpanOptions {
	attributes?: Attributes;
	kind?: SpanKind;
	spanOptions?: Omit<SpanOptions, "attributes" | "kind">;
}

function toSpanOptions(options?: ManualSpanOptions): SpanOptions | undefined {
	if (!options) return undefined;
	return {
		...options.spanOptions,
		attributes: options.attributes,
		kind: options.kind,
	};
}

/**
 * Begin a manual span.
 *
 * @param name - The name of the span.
 * @param options - The options for the span.
 * @returns The span.
 */
export function beginSpan(name: string, options?: ManualSpanOptions): Span {
	return manualTracer.startSpan(name, toSpanOptions(options), context.active());
}

/**
 * Execute a handler with a manual span.
 *
 * @param name - The name of the span.
 * @param handler - The handler to execute.
 * @param options - The options for the span.
 * @returns The result of the handler.
 */
export async function withSpan<T>(
	name: string,
	handler: (span: Span) => Promise<T> | T,
	options?: ManualSpanOptions,
): Promise<T> {
	const span = beginSpan(name, options);
	const spanContext = trace.setSpan(context.active(), span);

	try {
		return await context.with(spanContext, () => handler(span));
	} catch (error) {
		span.recordException(error instanceof Error ? error : { message: String(error) });
		span.setStatus({ code: SpanStatusCode.ERROR, message: String(error) });
		throw error;
	} finally {
		span.end();
	}
}
