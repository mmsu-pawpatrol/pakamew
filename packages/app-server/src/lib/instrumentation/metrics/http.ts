import { meter, ValueType, type MetricAttributes } from "./core";
import { addPathAttribute, toStatusClass } from "./policy";

const httpRequestCount = meter.createCounter("http.server.request.count", {
	description: "Count of HTTP requests handled by the server.",
	valueType: ValueType.INT,
});

const httpRequestDuration = meter.createHistogram("http.server.request.duration", {
	description: "Duration of HTTP requests handled by the server.",
	unit: "ms",
	valueType: ValueType.DOUBLE,
});

const httpActiveRequests = meter.createUpDownCounter("http.server.active_requests", {
	description: "Number of in-flight HTTP requests.",
	valueType: ValueType.INT,
});

const httpRequestSize = meter.createHistogram("http.server.request.size", {
	description: "Request payload size in bytes.",
	unit: "By",
	valueType: ValueType.INT,
});

const httpResponseSize = meter.createHistogram("http.server.response.size", {
	description: "Response payload size in bytes.",
	unit: "By",
	valueType: ValueType.INT,
});

function isNonNegative(value: number | undefined): value is number {
	return value !== undefined && Number.isFinite(value) && value >= 0;
}

export function beginHttpRequestMetrics(method: string, route: string): () => void {
	const attributes: MetricAttributes = {
		"http.request.method": method,
	};

	addPathAttribute(attributes, "http.route", route);
	httpActiveRequests.add(1, attributes);

	return () => {
		httpActiveRequests.add(-1, attributes);
	};
}

export interface HttpRequestMetricRecord {
	method: string;
	route: string;
	statusCode: number;
	durationMs: number;
	requestSizeBytes?: number;
	responseSizeBytes?: number;
}

export function recordHttpRequestMetrics(record: HttpRequestMetricRecord): void {
	const attributes: MetricAttributes = {
		"http.request.method": record.method,
		"http.response.status_code": record.statusCode,
		"http.response.status_class": toStatusClass(record.statusCode),
	};

	addPathAttribute(attributes, "http.route", record.route);

	httpRequestCount.add(1, attributes);
	httpRequestDuration.record(record.durationMs, attributes);

	if (isNonNegative(record.requestSizeBytes)) {
		httpRequestSize.record(record.requestSizeBytes, attributes);
	}

	if (isNonNegative(record.responseSizeBytes)) {
		httpResponseSize.record(record.responseSizeBytes, attributes);
	}
}
