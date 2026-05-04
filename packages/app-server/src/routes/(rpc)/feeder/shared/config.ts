import { getEnv } from "../../../../env";
import type { FeederTarget } from "./contracts";

export interface FeederRelayConfig {
	brokerUrl: string;
	username: string;
	password: string;
	target: FeederTarget;
	ackTimeoutMs: number;
}

export function getFeederRelayConfig(): FeederRelayConfig {
	const env = getEnv((shape) => [
		shape.MQTT_BROKER_URL,
		shape.MQTT_USERNAME,
		shape.MQTT_PASSWORD,
		shape.MQTT_DEVICE_ID,
		shape.MQTT_COMMAND_TOPIC,
		shape.MQTT_STATUS_TOPIC,
		shape.MQTT_EVENTS_TOPIC,
		shape.MQTT_ACK_TIMEOUT_MS,
	]);

	return {
		brokerUrl: env.MQTT_BROKER_URL,
		username: env.MQTT_USERNAME,
		password: env.MQTT_PASSWORD,
		target: {
			deviceId: env.MQTT_DEVICE_ID,
			commandTopic: env.MQTT_COMMAND_TOPIC,
			statusTopic: env.MQTT_STATUS_TOPIC,
			eventsTopic: env.MQTT_EVENTS_TOPIC,
		},
		ackTimeoutMs: env.MQTT_ACK_TIMEOUT_MS,
	};
}
