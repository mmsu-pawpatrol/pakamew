import { SpanKind } from "@opentelemetry/api";
import { $ESCALATE, getLogger, withSpan } from "../../../../instrumentation/core";
import { getFeederRelayConfig } from "./config";
import {
	FeederCommandPayloadSchema,
	FeederDeviceMessageSchema,
	FeederTriggerResponseSchema,
	type FeederDeviceMessage,
	type FeederTriggerInput,
	type FeederTriggerResponse,
} from "./contracts";
import { buildFeederStatus, recordDeviceMessage, recordTriggerResult } from "./device-state";
import { ensureRelayClient, waitForBrokerConnection } from "./mqtt-client";
import { resolvePendingAcknowledgement, setPendingAcknowledgement } from "./pending-acknowledgements";

const logger = getLogger().child({ scope: "feeder.mqtt-relay" });

function handleIncomingMessage(topic: string, payload: Buffer) {
	const config = getFeederRelayConfig();
	if (topic !== config.target.statusTopic && topic !== config.target.eventsTopic) {
		return;
	}

	let parsedPayload: unknown;
	try {
		parsedPayload = JSON.parse(payload.toString("utf8"));
	} catch (error) {
		logger.warn(
			{
				event: "feeder.mqtt.invalid_json",
				topic,
				error,
			},
			"Ignoring feeder MQTT payload with invalid JSON",
		);
		return;
	}

	const parsedMessage = FeederDeviceMessageSchema.safeParse(parsedPayload);
	if (!parsedMessage.success) {
		logger.warn(
			{
				event: "feeder.mqtt.invalid_payload",
				topic,
				issues: parsedMessage.error.issues,
			},
			"Ignoring feeder MQTT payload with an unexpected shape",
		);
		return;
	}

	const source = topic === config.target.statusTopic ? "status" : "events";
	recordDeviceMessage(source, parsedMessage.data);

	if (!parsedMessage.data.requestId) {
		return;
	}

	if (
		parsedMessage.data.state === "accepted" ||
		parsedMessage.data.state === "busy" ||
		parsedMessage.data.state === "failed"
	) {
		resolvePendingAcknowledgement(parsedMessage.data.requestId, parsedMessage.data);
	}
}

function toResponse(params: {
	requestId: string;
	command: FeederTriggerInput;
	requestedAt: number;
	result: FeederTriggerResponse["result"];
	acknowledgementState: FeederTriggerResponse["acknowledgementState"];
	brokerConnected: boolean;
	message: string | null;
}): FeederTriggerResponse {
	const { target } = getFeederRelayConfig();

	return FeederTriggerResponseSchema.parse({
		requestId: params.requestId,
		deviceId: target.deviceId,
		command: params.command,
		result: params.result,
		acknowledged: params.acknowledgementState != null,
		acknowledgementState: params.acknowledgementState,
		requestedAt: params.requestedAt,
		respondedAt: Date.now(),
		brokerConnected: params.brokerConnected,
		message: params.message,
		target,
	});
}

export function getFeederStatus() {
	const config = getFeederRelayConfig();
	const client = ensureRelayClient(handleIncomingMessage);

	return buildFeederStatus({
		target: config.target,
		brokerUrl: config.brokerUrl,
		brokerConnected: client.connected,
		ackTimeoutMs: config.ackTimeoutMs,
	});
}

export async function publishFeederCommand(command: FeederTriggerInput) {
	const config = getFeederRelayConfig();
	const client = ensureRelayClient(handleIncomingMessage);
	const requestId = crypto.randomUUID();
	const requestedAt = Date.now();
	const payload = FeederCommandPayloadSchema.parse({
		requestId,
		deviceId: config.target.deviceId,
		mode: command.mode,
		requestedAt,
		angle: command.mode === "angle" ? command.angle : undefined,
		openDurationMs: command.mode === "duration" ? command.openDurationMs : undefined,
	});

	const response = await withSpan(
		"feeder.mqtt.publish_wait",
		async () => {
			const brokerConnected = await waitForBrokerConnection(client);
			if (!brokerConnected) {
				return toResponse({
					requestId,
					command,
					requestedAt,
					result: "error",
					acknowledgementState: null,
					brokerConnected: false,
					message: "broker connection is unavailable",
				});
			}

			const acknowledgement = await new Promise<FeederDeviceMessage | null>((resolve) => {
				const timeout = setTimeout(() => {
					resolvePendingAcknowledgement(requestId, null);
				}, config.ackTimeoutMs);

				setPendingAcknowledgement(requestId, {
					command,
					requestedAt,
					resolve,
					timeout,
				});

				client.publish(config.target.commandTopic, JSON.stringify(payload), { qos: 1, retain: false }, (error) => {
					if (!error) {
						return;
					}

					logger.error(
						{
							event: "feeder.mqtt.publish_error",
							error,
							requestId,
							[$ESCALATE]: "feeder.mqtt.publish",
						},
						"Failed to publish feeder MQTT command",
					);
					resolvePendingAcknowledgement(requestId, {
						deviceId: config.target.deviceId,
						state: "failed",
						busy: false,
						timestamp: Date.now(),
						message: "publish failed",
						mode: command.mode,
						requestId,
						angle: command.mode === "angle" ? command.angle : undefined,
						openDurationMs: command.mode === "duration" ? command.openDurationMs : undefined,
					});
				});
			});

			if (acknowledgement == null) {
				return toResponse({
					requestId,
					command,
					requestedAt,
					result: "timeout",
					acknowledgementState: null,
					brokerConnected: client.connected,
					message: "publish succeeded but the device acknowledgement timed out",
				});
			}

			if (acknowledgement.state === "busy") {
				return toResponse({
					requestId,
					command,
					requestedAt,
					result: "busy",
					acknowledgementState: "busy",
					brokerConnected: client.connected,
					message: acknowledgement.message ?? "device rejected the command because it is busy",
				});
			}

			if (acknowledgement.state === "accepted") {
				return toResponse({
					requestId,
					command,
					requestedAt,
					result: "accepted",
					acknowledgementState: "accepted",
					brokerConnected: client.connected,
					message: acknowledgement.message ?? "device accepted the command",
				});
			}

			return toResponse({
				requestId,
				command,
				requestedAt,
				result: "error",
				acknowledgementState: acknowledgement.state,
				brokerConnected: client.connected,
				message: acknowledgement.message ?? "device returned an unexpected acknowledgement state",
			});
		},
		{
			kind: SpanKind.INTERNAL,
			attributes: {
				"messaging.system": "mqtt",
				"messaging.destination": config.target.commandTopic,
				"messaging.operation": "publish",
				"pakamew.feeder.device_id": config.target.deviceId,
				"pakamew.feeder.mode": command.mode,
			},
		},
	);

	recordTriggerResult(response);

	logger.info(
		{
			event: "feeder.command.result",
			requestId: response.requestId,
			result: response.result,
			acknowledgementState: response.acknowledgementState,
			mode: response.command.mode,
			deviceId: response.deviceId,
		},
		"Handled feeder command request",
	);

	return response;
}
