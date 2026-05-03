import { connect, type MqttClient } from "mqtt";
import { $ESCALATE, getLogger } from "../../../../instrumentation/core";
import { getFeederRelayConfig } from "./config";

interface RelayClientState {
	client: MqttClient | null;
}

const logger = getLogger().child({ scope: "feeder.mqtt-client" });

function getRelayClientState() {
	const globalState = globalThis as typeof globalThis & {
		__pakamewFeederRelayClient?: RelayClientState;
	};

	globalState.__pakamewFeederRelayClient ??= {
		client: null,
	};

	return globalState.__pakamewFeederRelayClient;
}

export function ensureRelayClient(onMessage: (topic: string, payload: Buffer) => void) {
	const relayClientState = getRelayClientState();
	if (relayClientState.client) {
		return relayClientState.client;
	}

	const config = getFeederRelayConfig();
	const client = connect(config.brokerUrl, {
		username: config.username || undefined,
		password: config.password || undefined,
		clientId: `pakamew-server-${process.pid}`,
		keepalive: 30,
		connectTimeout: 3_000,
		reconnectPeriod: 1_000,
		resubscribe: true,
	});

	client.on("connect", () => {
		client.subscribe([config.target.statusTopic, config.target.eventsTopic], (error) => {
			if (error) {
				logger.error(
					{
						event: "feeder.mqtt.subscribe_error",
						error,
						target: config.target,
						[$ESCALATE]: "feeder.mqtt.subscribe",
					},
					"Failed to subscribe to feeder MQTT topics",
				);
				return;
			}

			logger.info({ event: "feeder.mqtt.connected", target: config.target }, "Connected to feeder MQTT broker");
		});
	});

	client.on("message", onMessage);

	client.on("close", () => {
		logger.warn({ event: "feeder.mqtt.disconnected" }, "Disconnected from feeder MQTT broker");
	});

	client.on("error", (error) => {
		logger.error(
			{
				event: "feeder.mqtt.client_error",
				error,
				[$ESCALATE]: "feeder.mqtt.client",
			},
			"Feeder MQTT client error",
		);
	});

	relayClientState.client = client;
	return client;
}

export async function waitForBrokerConnection(client: MqttClient, timeoutMs = 3_000) {
	if (client.connected) {
		return true;
	}

	return await new Promise<boolean>((resolve) => {
		const timeout = setTimeout(() => {
			cleanup();
			resolve(false);
		}, timeoutMs);

		const handleConnect = () => {
			cleanup();
			resolve(true);
		};

		const handleError = () => {
			cleanup();
			resolve(false);
		};

		function cleanup() {
			clearTimeout(timeout);
			client.off("connect", handleConnect);
			client.off("error", handleError);
		}

		client.on("connect", handleConnect);
		client.on("error", handleError);
	});
}
