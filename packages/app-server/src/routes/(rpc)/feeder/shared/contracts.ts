import z from "zod";

export const FeederModeSchema = z.enum(["angle", "duration"]);
export type FeederMode = z.infer<typeof FeederModeSchema>;

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
export type FeederTriggerInput = z.infer<typeof FeederTriggerInputSchema>;

export const FeederTriggerResultSchema = z.enum(["accepted", "busy", "timeout", "error"]);
export type FeederTriggerResult = z.infer<typeof FeederTriggerResultSchema>;

export const FeederDeviceStateSchema = z.enum(["accepted", "busy", "completed", "failed", "booted", "offline"]);
export type FeederDeviceState = z.infer<typeof FeederDeviceStateSchema>;

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
export type FeederCommandPayload = z.infer<typeof FeederCommandPayloadSchema>;

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
export type FeederDeviceMessage = z.infer<typeof FeederDeviceMessageSchema>;

export const FeederTargetSchema = z.object({
	deviceId: z.string().min(1),
	commandTopic: z.string().min(1),
	statusTopic: z.string().min(1),
	eventsTopic: z.string().min(1),
});
export type FeederTarget = z.infer<typeof FeederTargetSchema>;

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
export type FeederCommandSummary = z.infer<typeof FeederCommandSummarySchema>;

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
export type FeederStatus = z.infer<typeof FeederStatusSchema>;

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
export type FeederTriggerResponse = z.infer<typeof FeederTriggerResponseSchema>;
