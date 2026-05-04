/**
 * Payment provider environment variables.
 *
 * Xendit hosted checkout and webhook handling read their provider settings
 * through this typed env module instead of direct process environment access.
 */

import z from "zod";

function parseAllowedPaymentChannels(value: string): string[] {
	const channels = value
		.split(",")
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);

	if (channels.length === 0) {
		throw new Error("XENDIT_ALLOWED_PAYMENT_CHANNELS must contain at least one payment channel.");
	}

	return Array.from(new Set(channels));
}

function normalizeBaseUrl(value: string): string {
	return value.replace(/\/+$/, "");
}

/** Payment provider environment contract for hosted checkout and webhooks. */
export interface PaymentsEnv {
	/** Xendit API secret key for basic-auth requests. */
	XENDIT_SECRET_KEY: string;

	/** Base URL for the Xendit API. */
	XENDIT_BASE_URL: string;

	/** Shared callback token used to verify Xendit webhooks. */
	XENDIT_WEBHOOK_CALLBACK_TOKEN: string;

	/** Return URL used after successful hosted checkout. */
	XENDIT_SUCCESS_RETURN_URL: string;

	/** Return URL used after the donor cancels hosted checkout. */
	XENDIT_CANCEL_RETURN_URL: string;

	/** Allowed hosted-checkout payment channels for the donation MVP. */
	XENDIT_ALLOWED_PAYMENT_CHANNELS: string[];
}

/** Runtime schema for payment provider environment variables. */
export const PaymentsEnvSchema = z.object({
	XENDIT_SECRET_KEY: z.string().min(1),

	XENDIT_BASE_URL: z
		.url()
		.default("https://api.xendit.co")
		.transform((value) => normalizeBaseUrl(value)),

	XENDIT_WEBHOOK_CALLBACK_TOKEN: z.string().min(1),

	XENDIT_SUCCESS_RETURN_URL: z.string().url(),

	XENDIT_CANCEL_RETURN_URL: z.string().url(),

	XENDIT_ALLOWED_PAYMENT_CHANNELS: z
		.string()
		.default("GCASH,PAYMAYA,GRABPAY,SHOPEEPAY")
		.transform((value, ctx) => {
			try {
				return parseAllowedPaymentChannels(value);
			} catch (error) {
				ctx.addIssue({
					code: "custom",
					message: error instanceof Error ? error.message : "Invalid Xendit payment channels.",
				});

				return z.NEVER;
			}
		}),
}) satisfies z.ZodType<PaymentsEnv>;
