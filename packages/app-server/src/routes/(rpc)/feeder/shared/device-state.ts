/**
 * In-memory feeder device state snapshot helpers.
 */

import type {
	FeederCommandSummary,
	FeederDeviceMessage,
	FeederStatus,
	FeederTarget,
	FeederTriggerInput,
	FeederTriggerResponse,
} from "./contracts";

interface CachedDeviceSnapshot {
	requestId: string | null;
	state: FeederStatus["latestKnownDeviceState"]["state"];
	busy: boolean;
	timestamp: number | null;
	mode: FeederStatus["latestKnownDeviceState"]["mode"];
	angle: number | null;
	openDurationMs: number | null;
	message: string | null;
	source: FeederStatus["latestKnownDeviceState"]["source"];
}

const currentDeviceSnapshot: CachedDeviceSnapshot = {
	requestId: null,
	state: "unknown",
	busy: false,
	timestamp: null,
	mode: null,
	angle: null,
	openDurationMs: null,
	message: null,
	source: null,
};

let lastCommandSummary: FeederCommandSummary | null = null;

function toNullableAngle(command: FeederTriggerInput) {
	return command.mode === "angle" ? command.angle : null;
}

function toNullableOpenDuration(command: FeederTriggerInput) {
	return command.mode === "duration" ? command.openDurationMs : null;
}

/** Record the latest relay response for a submitted feeder command. */
export function recordTriggerResult(response: FeederTriggerResponse) {
	lastCommandSummary = {
		requestId: response.requestId,
		mode: response.command.mode,
		angle: toNullableAngle(response.command),
		openDurationMs: toNullableOpenDuration(response.command),
		result: response.result,
		acknowledgementState: response.acknowledgementState,
		submittedAt: response.requestedAt,
		respondedAt: response.respondedAt,
		message: response.message,
	};
}

/**
 * Record a feeder status/event message as the latest known device state.
 *
 * @param source - MQTT topic family that produced the message.
 * @param message - Parsed device message whose device timestamp is intentionally ignored.
 * @param receivedAt - Backend receive time to store as the operational event timestamp.
 */
export function recordDeviceMessage(
	source: "status" | "events",
	message: FeederDeviceMessage,
	receivedAt = Date.now(),
) {
	currentDeviceSnapshot.requestId = message.requestId ?? null;
	currentDeviceSnapshot.state = message.state;
	currentDeviceSnapshot.busy = message.busy;
	currentDeviceSnapshot.timestamp = receivedAt;
	currentDeviceSnapshot.mode = message.mode ?? null;
	currentDeviceSnapshot.angle = message.angle ?? null;
	currentDeviceSnapshot.openDurationMs = message.openDurationMs ?? null;
	currentDeviceSnapshot.message = message.message ?? null;
	currentDeviceSnapshot.source = source;

	if (!lastCommandSummary) {
		return;
	}

	if (!message.requestId || message.requestId !== lastCommandSummary.requestId) {
		return;
	}

	lastCommandSummary = {
		...lastCommandSummary,
		acknowledgementState: message.state,
		respondedAt: receivedAt,
		message: message.message ?? lastCommandSummary.message,
		result: message.state === "busy" ? "busy" : message.state === "accepted" ? "accepted" : lastCommandSummary.result,
	};
}

/** Build the public feeder status snapshot from relay and device state. */
export function buildFeederStatus(params: {
	target: FeederTarget;
	brokerUrl: string;
	brokerConnected: boolean;
	ackTimeoutMs: number;
}): FeederStatus {
	return {
		deviceId: params.target.deviceId,
		broker: {
			url: params.brokerUrl,
			connected: params.brokerConnected,
			commandTopic: params.target.commandTopic,
			statusTopic: params.target.statusTopic,
			eventsTopic: params.target.eventsTopic,
		},
		latestKnownDeviceState: { ...currentDeviceSnapshot },
		lastCommand: lastCommandSummary,
		limits: {
			angle: {
				min: 1,
				max: 360,
				default: 180,
			},
			duration: {
				min: 200,
				max: 30000,
				default: 1000,
			},
			ackTimeoutMs: params.ackTimeoutMs,
			modes: {
				angle: true,
				duration: true,
			},
		},
	};
}
