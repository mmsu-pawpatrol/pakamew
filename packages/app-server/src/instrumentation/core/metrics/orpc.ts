import { addAttribute, meter, ValueType, type MetricAttributes } from "./core";
import { addPathAttribute, toStatusClass } from "./policy";

const orpcProcedureCount = meter.createCounter("orpc.procedure.count", {
	description: "Count of oRPC procedure executions.",
	valueType: ValueType.INT,
});

const orpcProcedureDuration = meter.createHistogram("orpc.procedure.duration", {
	description: "Duration of oRPC procedure executions.",
	unit: "ms",
	valueType: ValueType.DOUBLE,
});

const orpcErrorCount = meter.createCounter("orpc.error.count", {
	description: "Count of oRPC errors.",
	valueType: ValueType.INT,
});

export interface OrpcMetricRecord {
	procedure: string;
	result: "success" | "error" | "not_found";
	durationMs: number;
	statusCode: number;
	errorCode?: string;
}

export function recordOrpcMetrics(record: OrpcMetricRecord): void {
	const attributes: MetricAttributes = {
		"orpc.result": record.result,
		"http.response.status_code": record.statusCode,
		"http.response.status_class": toStatusClass(record.statusCode),
	};

	addPathAttribute(attributes, "orpc.procedure", record.procedure);

	orpcProcedureCount.add(1, attributes);
	orpcProcedureDuration.record(record.durationMs, attributes);

	if (record.result === "error") {
		const errorAttributes: MetricAttributes = {
			...attributes,
		};
		addAttribute(errorAttributes, "orpc.error_code", record.errorCode);
		orpcErrorCount.add(1, errorAttributes);
	}
}
