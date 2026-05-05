/**
 * Shared payment-session response utilities.
 *
 * The create and get callables both normalize Xendit's response into this
 * narrower shape because the donation flow only needs these fields for
 * persistence and reconciliation.
 */

import z from "zod";

/** Payment-session status returned by Xendit. */
export const PaymentSessionStatusSchema = z.enum(["ACTIVE", "COMPLETED", "EXPIRED", "CANCELED"]);

/** Payment-session status returned by Xendit. */
export type PaymentSessionStatus = z.infer<typeof PaymentSessionStatusSchema>;

const NullablePaymentReferenceSchema = z
	.string()
	.min(1)
	.nullish()
	.transform((value) => value ?? null);

/** Payment-session payload returned by Xendit. */
export const PaymentSessionSchema = z
	.object({
		id: z.string().min(1).optional(),
		payment_session_id: z.string().min(1).optional(),
		reference_id: z.string().min(1),
		status: PaymentSessionStatusSchema,
		payment_link_url: NullablePaymentReferenceSchema,
		expires_at: z.string().min(1),
		payment_request_id: NullablePaymentReferenceSchema,
		payment_id: NullablePaymentReferenceSchema,
	})
	.transform((value, ctx) => {
		const id = value.id ?? value.payment_session_id;
		if (!id) {
			ctx.addIssue({
				code: "custom",
				message: "Xendit payment session response is missing payment_session_id.",
			});

			return z.NEVER;
		}

		return {
			id,
			reference_id: value.reference_id,
			status: value.status,
			payment_link_url: value.payment_link_url,
			expires_at: value.expires_at,
			payment_request_id: value.payment_request_id,
			payment_id: value.payment_id,
		};
	});

/** Payment-session payload returned by Xendit. */
export type PaymentSession = z.infer<typeof PaymentSessionSchema>;

/**
 * Create a Xendit basic-auth header.
 *
 * @param secretKey - Xendit secret key.
 * @returns The authorization header value.
 */
export function toAuthorizationHeader(secretKey: string): string {
	return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}
