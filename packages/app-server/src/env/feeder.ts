import z from "zod";

export interface FeederEnv {
	/** Use an in-process feeder simulator instead of MQTT hardware. */
	DEV_MOCK_FEEDER: boolean;

	/** MQTT broker URL used by the feeder relay. */
	MQTT_BROKER_URL: string;

	/** Optional MQTT username for broker authentication. */
	MQTT_USERNAME: string;

	/** Optional MQTT password for broker authentication. */
	MQTT_PASSWORD: string;

	/** Logical feeder device identifier. */
	MQTT_DEVICE_ID: string;

	/** MQTT topic used to publish feeder commands. */
	MQTT_COMMAND_TOPIC: string;

	/** MQTT topic used to receive retained feeder status updates. */
	MQTT_STATUS_TOPIC: string;

	/** MQTT topic used to receive feeder event updates. */
	MQTT_EVENTS_TOPIC: string;

	/** Milliseconds to wait for the first device acknowledgement. */
	MQTT_ACK_TIMEOUT_MS: number;
}

export const FeederEnvSchema = z.object({
	DEV_MOCK_FEEDER: z.stringbool().default(false),

	MQTT_BROKER_URL: z.string().min(1).default("mqtt://broker.hivemq.com:1883"),

	MQTT_USERNAME: z.string().default(""),

	MQTT_PASSWORD: z.string().default(""),

	MQTT_DEVICE_ID: z.string().min(1).default("feeder-1"),

	MQTT_COMMAND_TOPIC: z.string().min(1).default("pakamew/demo/feeder-1/commands"),

	MQTT_STATUS_TOPIC: z.string().min(1).default("pakamew/demo/feeder-1/status"),

	MQTT_EVENTS_TOPIC: z.string().min(1).default("pakamew/demo/feeder-1/events"),

	MQTT_ACK_TIMEOUT_MS: z.coerce.number().int().min(500).max(10000).default(2500),
}) satisfies z.ZodType<FeederEnv>;
