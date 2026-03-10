import { metrics, ValueType, type Attributes } from "@opentelemetry/api";
import { config } from "../config";

export { ValueType };
export type MetricAttributes = Attributes;

const meterServiceName = config.otel?.OTEL_SERVICE_NAME ?? "pakamew-server";
const meterServiceVersion = config.otel?.OTEL_SERVICE_VERSION ?? "0.0.0";

export const meter = metrics.getMeter(`${meterServiceName}.metrics`, meterServiceVersion);

export function addAttribute(attributes: Attributes, key: string, value: string | number | undefined): void {
	if (value !== undefined) {
		attributes[key] = value;
	}
}
