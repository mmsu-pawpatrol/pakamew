/**
 * Internal Xendit payment-session creation.
 *
 * This file defines the oRPC callable that sends hosted-checkout creation
 * requests to Xendit and normalizes the response shape used by the donation
 * flow. The procedure is internal to the server and is invoked through
 * `XenditClient.PaymentSession.create()`.
 */

import { ORPCError, type } from "@orpc/server";
import { getLogger } from "../../../instrumentation/core";
import { base } from "../context";
import { PaymentSessionSchema, toAuthorizationHeader, type PaymentSession } from "./shared";

const logger = getLogger().child({ scope: "xendit.payment-session.create" });

/** Hosted-checkout payload sent to Xendit Payment Sessions. */
export interface PaymentSessionCreateInput {
	reference_id: string;
	session_type: "PAY";
	mode: "PAYMENT_LINK";
	amount: number;
	currency: "PHP";
	country: "PH";
	customer: {
		reference_id: string;
		type: "INDIVIDUAL";
		individual_detail: {
			given_names: string;
		};
	};
	allowed_payment_channels: string[];
	success_return_url: string;
	cancel_return_url: string;
	description: string;
	metadata: Record<string, string>;
}

/**
 * Create a hosted payment session in Xendit.
 *
 * @remarks
 * Input is the hosted-checkout payload already validated by the donation
 * flow, including donor details, return URLs, and allowed channels. Output is
 * the normalized subset of the Xendit payment-session response that the
 * server persists and polls against later.
 *
 * @param input - Hosted-checkout payload sent to Xendit.
 */
export const create = base
	.input(type<PaymentSessionCreateInput>())
	.output(PaymentSessionSchema)
	.handler(async ({ context, input }) => {
		// The wrapper calls Xendit's plain REST endpoint because the installed SDK does not expose Payment Sessions.
		const url = new URL("/sessions", `${context.xendit.config.baseUrl}/`);
		const response = await context.xendit.services.fetch(url, {
			method: "POST",
			headers: {
				"accept": "application/json",
				"authorization": toAuthorizationHeader(context.xendit.config.secretKey),
				"content-type": "application/json",
			},
			body: JSON.stringify(input),
		});

		if (!response.ok) {
			// Only a bounded response slice is logged to avoid leaking full provider payloads.
			const body = await response.text();

			logger.error(
				{
					event: "xendit.payment-session.create.failed",
					status: response.status,
					statusText: response.statusText,
					responseBody: body.slice(0, 500),
				},
				"Failed to create Xendit payment session",
			);

			throw new ORPCError("BAD_GATEWAY", {
				message: `Xendit session creation failed with status ${response.status}.`,
			});
		}

		return PaymentSessionSchema.parse(await response.json()) satisfies PaymentSession;
	})
	.callable();
