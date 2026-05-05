/**
 * Feeder RPC and MQTT contract schemas.
 */

import z from "zod";

/** Supported feeder command modes. */
export const FeederModeSchema = z.enum(["angle", "duration"]);

/** Supported feeder command mode. */
export type FeederMode = z.infer<typeof FeederModeSchema>;

/** Public feeder trigger input schema. */
export const FeederTriggerInputSchema = z.discriminatedUnion("mode", [
	z.object({
		mode: z.literal("angle"),
		angle: z.number().int().min(1).max(360),
	}),
	z.object({
		mode: z.literal("duration"),
		openDurationMs: z.number().int().min(200).max(30000),
	}),
]);

/** Public feeder trigger input. */
export type FeederTriggerInput = z.infer<typeof FeederTriggerInputSchema>;

/** Relay acknowledgement result schema. */
export const FeederTriggerResultSchema = z.enum(["accepted", "busy", "timeout", "error"]);

/** Relay acknowledgement result. */
export type FeederTriggerResult = z.infer<typeof FeederTriggerResultSchema>;

/** Device-reported feeder state schema. */
export const FeederDeviceStateSchema = z.enum(["accepted", "busy", "completed", "failed", "booted", "offline"]);

/** Device-reported feeder state. */
export type FeederDeviceState = z.infer<typeof FeederDeviceStateSchema>;

/** MQTT command payload schema sent to the feeder device. */
export const FeederCommandPayloadSchema = z
	.object({
		requestId: z.uuid(),
		deviceId: z.string().min(1),
		mode: FeederModeSchema,
		requestedAt: z.number().int().nonnegative(),
		angle: z.number().int().min(1).max(360).optional(),
		openDurationMs: z.number().int().min(200).max(30000).optional(),
	})
	.superRefine((value, ctx) => {
		if (value.mode === "angle" && value.angle == null) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "angle commands require an angle value",
				path: ["angle"],
			});
		}

		if (value.mode === "duration" && value.openDurationMs == null) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "duration commands require an openDurationMs value",
				path: ["openDurationMs"],
			});
		}
	});

/** MQTT command payload sent to the feeder device. */
export type FeederCommandPayload = z.infer<typeof FeederCommandPayloadSchema>;

/** MQTT status/event message schema emitted by the feeder device. */
export const FeederDeviceMessageSchema = z.object({
	requestId: z.string().min(1).optional(),
	deviceId: z.string().min(1),
	state: FeederDeviceStateSchema,
	busy: z.boolean().optional().default(false),
	timestamp: z.number().int().nonnegative(),
	mode: FeederModeSchema.optional(),
	angle: z.number().int().min(1).max(360).optional(),
	openDurationMs: z.number().int().min(200).max(30000).optional(),
	message: z.string().min(1).optional(),
});

/** MQTT status/event message emitted by the feeder device. */
export type FeederDeviceMessage = z.infer<typeof FeederDeviceMessageSchema>;

/** MQTT target topics for the configured feeder device. */
export const FeederTargetSchema = z.object({
	deviceId: z.string().min(1),
	commandTopic: z.string().min(1),
	statusTopic: z.string().min(1),
	eventsTopic: z.string().min(1),
});

/** MQTT target topics for the configured feeder device. */
export type FeederTarget = z.infer<typeof FeederTargetSchema>;

/** Last command summary schema exposed in feeder status. */
export const FeederCommandSummarySchema = z.object({
	requestId: z.string().min(1),
	mode: FeederModeSchema,
	angle: z.number().int().min(1).max(360).nullable(),
	openDurationMs: z.number().int().min(200).max(30000).nullable(),
	result: FeederTriggerResultSchema,
	acknowledgementState: FeederDeviceStateSchema.nullable(),
	submittedAt: z.number().int().nonnegative(),
	respondedAt: z.number().int().nonnegative().nullable(),
	message: z.string().nullable(),
});

/** Last command summary exposed in feeder status. */
export type FeederCommandSummary = z.infer<typeof FeederCommandSummarySchema>;

/** Public feeder status response schema. */
export const FeederStatusSchema = z.object({
	deviceId: z.string().min(1),
	broker: z.object({
		url: z.string().min(1),
		connected: z.boolean(),
		commandTopic: z.string().min(1),
		statusTopic: z.string().min(1),
		eventsTopic: z.string().min(1),
	}),
	latestKnownDeviceState: z.object({
		requestId: z.string().min(1).nullable(),
		state: z.union([FeederDeviceStateSchema, z.literal("unknown")]),
		busy: z.boolean(),
		timestamp: z.number().int().nonnegative().nullable(),
		mode: FeederModeSchema.nullable(),
		angle: z.number().int().min(1).max(360).nullable(),
		openDurationMs: z.number().int().min(200).max(30000).nullable(),
		message: z.string().nullable(),
		source: z.enum(["status", "events"]).nullable(),
	}),
	lastCommand: FeederCommandSummarySchema.nullable(),
	limits: z.object({
		angle: z.object({
			min: z.literal(1),
			max: z.literal(360),
			default: z.literal(180),
		}),
		duration: z.object({
			min: z.literal(200),
			max: z.literal(30000),
			default: z.literal(1000),
		}),
		ackTimeoutMs: z.number().int().positive(),
		modes: z.object({
			angle: z.literal(true),
			duration: z.literal(true),
		}),
	}),
});

/** Public feeder status response. */
export type FeederStatus = z.infer<typeof FeederStatusSchema>;

/** Public feeder trigger response schema. */
export const FeederTriggerResponseSchema = z.object({
	requestId: z.uuid(),
	deviceId: z.string().min(1),
	command: FeederTriggerInputSchema,
	result: FeederTriggerResultSchema,
	acknowledged: z.boolean(),
	acknowledgementState: FeederDeviceStateSchema.nullable(),
	requestedAt: z.number().int().nonnegative(),
	respondedAt: z.number().int().nonnegative(),
	brokerConnected: z.boolean(),
	message: z.string().nullable(),
	target: FeederTargetSchema,
});

/** Public feeder trigger response. */
export type FeederTriggerResponse = z.infer<typeof FeederTriggerResponseSchema>;
