import { PassThrough } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vitest";
import { $ESCALATE } from "../constants";
import { initLogger, type LoggerConfig } from "./core";

interface LoggedRecord extends Record<string, unknown> {
	msg?: string;
	reason?: string;
}

const TEST_CONFIG: LoggerConfig = {
	otel: {
		OTEL_EXPORTER_OTLP_ENDPOINT: "http://127.0.0.1:4318",
		OTEL_SERVICE_NAME: "pakamew-server",
		OTEL_SERVICE_VERSION: "0.0.0",
		OTEL_DEPLOYMENT_ENVIRONMENT: "test",
	},
	OBS_PRESET: "test",
	OBS_LOG_LEVEL: "info",
	OBS_ERROR_TRACE_WINDOW_MS: 1_000,
};

function createLogCapture() {
	const destination = new PassThrough();
	const lines: string[] = [];

	destination.on("data", (chunk: Buffer | string) => {
		lines.push(chunk.toString("utf8"));
	});

	return { destination, lines };
}

function collectRecords(lines: string[]): LoggedRecord[] {
	return lines
		.join("")
		.split("\n")
		.filter((line) => line.length > 0)
		.map((line) => JSON.parse(line) as LoggedRecord);
}

describe("initLogger", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("escalates to trace and strips the escalation marker from emitted logs", () => {
		vi.useFakeTimers();
		const { destination, lines } = createLogCapture();
		const logger = initLogger(TEST_CONFIG, destination);

		logger.error({ source: "test", [$ESCALATE]: true }, "Application error");

		expect(logger.level).toBe("trace");
		let records = collectRecords(lines);
		const errorRecord = records.find((record) => record.msg === "Application error");
		expect(errorRecord).toBeDefined();
		expect(errorRecord?.source).toBe("test");
		expect($ESCALATE in (errorRecord ?? {})).toBe(false);

		const escalationRecord = records.find(
			(record) => record.msg === "Temporarily escalating logger level to TRACE after error",
		);
		expect(escalationRecord?.reason).toBe("error");

		vi.advanceTimersByTime(TEST_CONFIG.OBS_ERROR_TRACE_WINDOW_MS);
		records = collectRecords(lines);
		expect(logger.level).toBe("info");
		expect(records.some((record) => record.msg === "Reverting logger level after TRACE escalation window")).toBe(true);
		destination.end();
	});

	it("uses custom escalation reason strings", () => {
		const { destination, lines } = createLogCapture();
		const logger = initLogger(TEST_CONFIG, destination);

		logger.error({ [$ESCALATE]: "prisma.error" }, "Application error");

		const records = collectRecords(lines);
		const escalationRecord = records.find(
			(record) => record.msg === "Temporarily escalating logger level to TRACE after error",
		);
		expect(escalationRecord?.reason).toBe("prisma.error");
		destination.end();
	});

	it("strips false markers without escalating level", () => {
		const { destination, lines } = createLogCapture();
		const logger = initLogger(TEST_CONFIG, destination);

		logger.error({ source: "test", [$ESCALATE]: false }, "Application error");

		const records = collectRecords(lines);
		const errorRecord = records.find((record) => record.msg === "Application error");
		expect($ESCALATE in (errorRecord ?? {})).toBe(false);
		expect(logger.level).toBe("info");
		destination.end();
	});
});
