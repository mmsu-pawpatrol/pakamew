import { addAttribute, meter, ValueType, type MetricAttributes } from "./core";
import { addDbTargetAttribute } from "./policy";

const prismaQueryCount = meter.createCounter("db.query.count", {
	description: "Count of Prisma database queries.",
	valueType: ValueType.INT,
});

const prismaQueryDuration = meter.createHistogram("db.query.duration", {
	description: "Duration of Prisma database queries.",
	unit: "ms",
	valueType: ValueType.DOUBLE,
});

const prismaQueryErrorCount = meter.createCounter("db.query.errors", {
	description: "Count of Prisma query errors.",
	valueType: ValueType.INT,
});

export interface PrismaQueryMetricRecord {
	operation: string;
	durationMs: number;
	target?: string;
}

export function recordPrismaQueryMetrics(record: PrismaQueryMetricRecord): void {
	const attributes: MetricAttributes = {
		"db.operation": record.operation,
	};
	addDbTargetAttribute(attributes, record.target);

	prismaQueryCount.add(1, attributes);
	prismaQueryDuration.record(record.durationMs, attributes);
}

export interface PrismaQueryErrorMetricRecord {
	operation?: string;
	target?: string;
}

export function recordPrismaQueryErrorMetrics(record: PrismaQueryErrorMetricRecord): void {
	const attributes: MetricAttributes = {};
	addAttribute(attributes, "db.operation", record.operation);
	addDbTargetAttribute(attributes, record.target);
	prismaQueryErrorCount.add(1, attributes);
}
