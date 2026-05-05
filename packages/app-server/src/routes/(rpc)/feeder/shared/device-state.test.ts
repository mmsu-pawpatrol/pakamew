import { afterEach, describe, expect, it, vi } from "vitest";
import { buildFeederStatus, recordDeviceMessage, recordTriggerResult } from "./device-state";

const Target = {
	deviceId: "test-feeder",
	commandTopic: "pakamew/test/command",
	statusTopic: "pakamew/test/status",
	eventsTopic: "pakamew/test/events",
};

function buildStatus() {
	return buildFeederStatus({
		target: Target,
		brokerUrl: "mqtt://test",
		brokerConnected: true,
		ackTimeoutMs: 3_000,
	});
}

describe("feeder device state", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("stores server receive time instead of the device-reported timestamp", () => {
		const receivedAt = new Date("2026-05-05T11:00:00.000Z");
		vi.useFakeTimers();
		vi.setSystemTime(receivedAt);

		recordDeviceMessage("events", {
			requestId: "test-request-1",
			deviceId: Target.deviceId,
			state: "completed",
			busy: false,
			timestamp: 218_126,
			message: "completed with unsynced device clock",
		});

		expect(buildStatus().latestKnownDeviceState.timestamp).toBe(receivedAt.getTime());
	});

	it("uses server receive time for the last command response summary", () => {
		const requestId = "test-request-2";
		const submittedAt = new Date("2026-05-05T11:01:00.000Z").getTime();
		const receivedAt = new Date("2026-05-05T11:01:03.500Z");
		vi.useFakeTimers();
		vi.setSystemTime(receivedAt);

		recordTriggerResult({
			requestId,
			deviceId: Target.deviceId,
			command: { mode: "duration", openDurationMs: 1_000 },
			result: "accepted",
			acknowledged: true,
			acknowledgementState: "accepted",
			requestedAt: submittedAt,
			respondedAt: submittedAt,
			brokerConnected: true,
			message: "accepted",
			target: Target,
		});
		recordDeviceMessage("events", {
			requestId,
			deviceId: Target.deviceId,
			state: "completed",
			busy: false,
			timestamp: 123_242,
			message: "completed with unsynced device clock",
		});

		expect(buildStatus().lastCommand?.respondedAt).toBe(receivedAt.getTime());
	});
});
