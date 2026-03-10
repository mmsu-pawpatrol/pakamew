import { meter, ValueType, type MetricAttributes } from "./core";
import { addPathAttribute, toStatusClass } from "./policy";

const httpRequestCount = meter.createCounter("http.server.request.count", {
	description: "Count of HTTP requests handled by the server.",
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

export interface HttpRequestMetricRecord {
	method: string;
	route: string;
	statusCode: number;
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

	if (isNonNegative(record.requestSizeBytes)) {
		httpRequestSize.record(record.requestSizeBytes, attributes);
	}

	if (isNonNegative(record.responseSizeBytes)) {
		httpResponseSize.record(record.responseSizeBytes, attributes);
	}
}
